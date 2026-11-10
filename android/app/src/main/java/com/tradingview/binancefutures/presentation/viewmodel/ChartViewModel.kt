package com.tradingview.binancefutures.presentation.viewmodel

import android.app.Application
import android.content.Context
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.tradingview.binancefutures.data.repository.TradingRepository
import com.tradingview.binancefutures.data.repository.TradingRepositoryImpl
import com.tradingview.binancefutures.domain.model.*
import java.util.UUID
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

data class ChartUiState(
    val symbol: String = "BTCUSDT",
    val timeframe: Timeframe = Timeframe.M1,
    val priceType: PriceType = PriceType.LAST,
    val candles: List<Candle> = emptyList(),
    val pairs: List<TradingPair> = emptyList(),
    val favorites: Set<String> = setOf("BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"),
    val drawings: List<Drawing> = emptyList(),
    val activeDrawingTool: DrawingType? = null,
    val selectedDrawingId: String? = null,
    val alerts: List<PriceAlert> = emptyList(),
    val replayState: BarReplayState = BarReplayState(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class ChartViewModel @JvmOverloads constructor(
    application: Application,
    private val repository: TradingRepository = TradingRepositoryImpl()
) : AndroidViewModel(application) {

    private val gson = Gson()
    private val prefs = application.getSharedPreferences("tradingview_binance_prefs", Context.MODE_PRIVATE)

    private val _uiState = MutableStateFlow(ChartUiState())
    val uiState: StateFlow<ChartUiState> = _uiState.asStateFlow()

    private var wsJob: Job? = null
    private var previousPrice: Float? = null

    init {
        loadSavedFavoritesAndAlerts()
        loadTradingPairs()
        loadCandles("BTCUSDT", Timeframe.M1)
    }

    private fun loadSavedFavoritesAndAlerts() {
        try {
            val favsJson = prefs.getString("saved_favorites", null)
            val savedFavs: Set<String>? = if (favsJson != null) {
                val type = object : TypeToken<Set<String>>() {}.type
                gson.fromJson(favsJson, type)
            } else null

            val alertsJson = prefs.getString("saved_alerts", null)
            val savedAlerts: List<PriceAlert>? = if (alertsJson != null) {
                val type = object : TypeToken<List<PriceAlert>>() {}.type
                gson.fromJson(alertsJson, type)
            } else null

            _uiState.value = _uiState.value.copy(
                favorites = savedFavs ?: _uiState.value.favorites,
                alerts = savedAlerts ?: emptyList()
            )
        } catch (e: Exception) {
            // fallback to defaults
        }
    }

    private fun saveAlertsToDisk(alerts: List<PriceAlert>) {
        try {
            val json = gson.toJson(alerts)
            prefs.edit().putString("saved_alerts", json).apply()
        } catch (e: Exception) {
            // ignore
        }
    }

    private fun saveFavoritesToDisk(favs: Set<String>) {
        try {
            val json = gson.toJson(favs)
            prefs.edit().putString("saved_favorites", json).apply()
        } catch (e: Exception) {
            // ignore
        }
    }

    fun loadTradingPairs() {
        viewModelScope.launch {
            try {
                val pairs = repository.getFuturesTradingPairs()
                _uiState.value = _uiState.value.copy(pairs = pairs)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(errorMessage = e.message)
            }
        }
    }

    fun selectSymbol(symbol: String) {
        if (_uiState.value.symbol == symbol) return
        _uiState.value = _uiState.value.copy(symbol = symbol)
        previousPrice = null
        loadCandles(symbol, _uiState.value.timeframe, _uiState.value.priceType)
    }

    fun selectTimeframe(tf: Timeframe) {
        if (_uiState.value.timeframe == tf) return
        _uiState.value = _uiState.value.copy(timeframe = tf)
        loadCandles(_uiState.value.symbol, tf, _uiState.value.priceType)
    }

    fun setPriceType(type: PriceType) {
        if (_uiState.value.priceType == type) return
        _uiState.value = _uiState.value.copy(priceType = type)
        loadCandles(_uiState.value.symbol, _uiState.value.timeframe, type)
    }

    fun toggleFavorite(symbol: String) {
        val current = _uiState.value.favorites
        val updated = if (current.contains(symbol)) current - symbol else current + symbol
        _uiState.value = _uiState.value.copy(favorites = updated)
        saveFavoritesToDisk(updated)
    }

    // Swipe coin navigation: Next & Previous coin in watchlist/pairs list
    fun selectNextCoin() {
        val pairs = _uiState.value.pairs
        if (pairs.isEmpty()) return
        val currentIndex = pairs.indexOfFirst { it.symbol == _uiState.value.symbol }
        if (currentIndex != -1 && currentIndex < pairs.size - 1) {
            selectSymbol(pairs[currentIndex + 1].symbol)
        } else if (currentIndex == -1 && pairs.isNotEmpty()) {
            selectSymbol(pairs.first().symbol)
        }
    }

    fun selectPreviousCoin() {
        val pairs = _uiState.value.pairs
        if (pairs.isEmpty()) return
        val currentIndex = pairs.indexOfFirst { it.symbol == _uiState.value.symbol }
        if (currentIndex > 0) {
            selectSymbol(pairs[currentIndex - 1].symbol)
        }
    }

    private fun loadCandles(symbol: String, tf: Timeframe, pType: PriceType = _uiState.value.priceType) {
        wsJob?.cancel()
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val history = repository.getHistoricalCandles(symbol, tf, pType)
                _uiState.value = _uiState.value.copy(candles = history, isLoading = false)
                if (history.isNotEmpty()) {
                    previousPrice = history.last().close
                }

                // Start WebSocket stream
                wsJob = launch {
                    repository.getLiveCandleStream(symbol, tf)
                        .catch { /* handle reconnect */ }
                        .collect { updatedCandle ->
                            val currentCandles = _uiState.value.candles.toMutableList()
                            if (currentCandles.isNotEmpty() && currentCandles.last().time == updatedCandle.time) {
                                currentCandles[currentCandles.size - 1] = updatedCandle
                            } else {
                                currentCandles.add(updatedCandle)
                            }
                            _uiState.value = _uiState.value.copy(candles = currentCandles)
                            checkAlerts(updatedCandle)
                        }
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = e.message)
            }
        }
    }

    // Drawings
    fun setActiveDrawingTool(tool: DrawingType?) {
        _uiState.value = _uiState.value.copy(activeDrawingTool = tool)
    }

    fun addDrawing(drawing: Drawing) {
        _uiState.value = _uiState.value.copy(
            drawings = _uiState.value.drawings + drawing,
            activeDrawingTool = null,
            selectedDrawingId = drawing.id
        )
    }

    fun updateDrawing(drawing: Drawing) {
        _uiState.value = _uiState.value.copy(
            drawings = _uiState.value.drawings.map { if (it.id == drawing.id) drawing else it }
        )
    }

    fun deleteDrawing(id: String) {
        _uiState.value = _uiState.value.copy(
            drawings = _uiState.value.drawings.filter { it.id != id },
            selectedDrawingId = null
        )
    }

    fun selectDrawing(id: String?) {
        _uiState.value = _uiState.value.copy(selectedDrawingId = id)
    }

    fun clearAllDrawings() {
        _uiState.value = _uiState.value.copy(drawings = emptyList(), selectedDrawingId = null)
    }

    // Customizable Alerts
    fun addAlert(
        symbol: String,
        targetPrice: Float,
        condition: AlertCondition,
        soundEnabled: Boolean = true,
        vibrateEnabled: Boolean = true
    ) {
        val alert = PriceAlert(
            id = UUID.randomUUID().toString(),
            symbol = symbol,
            targetPrice = targetPrice,
            condition = condition,
            soundEnabled = soundEnabled,
            vibrateEnabled = vibrateEnabled,
            isEnabled = true,
            isTriggered = false
        )
        val updated = _uiState.value.alerts + alert
        _uiState.value = _uiState.value.copy(alerts = updated)
        saveAlertsToDisk(updated)
    }

    fun toggleAlertEnabled(id: String) {
        val updated = _uiState.value.alerts.map {
            if (it.id == id) it.copy(isEnabled = !it.isEnabled, isTriggered = false) else it
        }
        _uiState.value = _uiState.value.copy(alerts = updated)
        saveAlertsToDisk(updated)
    }

    fun updateAlert(updatedAlert: PriceAlert) {
        val updated = _uiState.value.alerts.map {
            if (it.id == updatedAlert.id) updatedAlert else it
        }
        _uiState.value = _uiState.value.copy(alerts = updated)
        saveAlertsToDisk(updated)
    }

    fun deleteAlert(id: String) {
        val updated = _uiState.value.alerts.filter { it.id != id }
        _uiState.value = _uiState.value.copy(alerts = updated)
        saveAlertsToDisk(updated)
    }

    private fun checkAlerts(candle: Candle) {
        val currentPrice = candle.close
        val prev = previousPrice ?: currentPrice
        val currentSymbol = _uiState.value.symbol

        var updatedAlerts = false
        val newAlertList = _uiState.value.alerts.map { alert ->
            if (alert.symbol == currentSymbol && alert.isEnabled && !alert.isTriggered) {
                val isTriggered = when (alert.condition) {
                    AlertCondition.CROSSES_ABOVE -> prev <= alert.targetPrice && currentPrice >= alert.targetPrice
                    AlertCondition.CROSSES_BELOW -> prev >= alert.targetPrice && currentPrice <= alert.targetPrice
                    AlertCondition.CANDLE_CLOSES_ABOVE -> candle.close >= alert.targetPrice
                    AlertCondition.CANDLE_CLOSES_BELOW -> candle.close <= alert.targetPrice
                }
                if (isTriggered) {
                    updatedAlerts = true
                    if (alert.vibrateEnabled) {
                        triggerDeviceVibration(getApplication())
                    }
                    if (alert.soundEnabled) {
                        playAlertSound(getApplication())
                    }
                    alert.copy(isTriggered = true)
                } else {
                    alert
                }
            } else {
                alert
            }
        }

        previousPrice = currentPrice

        if (updatedAlerts) {
            _uiState.value = _uiState.value.copy(alerts = newAlertList)
            saveAlertsToDisk(newAlertList)
        }
    }

    fun triggerDeviceVibration(context: Context) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(VibrationEffect.createOneShot(350, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                @Suppress("DEPRECATION")
                vibrator?.vibrate(350)
            }
        } catch (e: Exception) {
            // ignore vibration error
        }
    }

    private fun playAlertSound(context: Context) {
        try {
            val notificationUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            val ringtone = RingtoneManager.getRingtone(context, notificationUri)
            ringtone?.play()
        } catch (e: Exception) {
            // ignore sound error
        }
    }
}
