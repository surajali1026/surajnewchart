package com.tradingview.binancefutures.presentation.ui.chart

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tradingview.binancefutures.domain.model.*
import com.tradingview.binancefutures.presentation.ui.theme.*
import java.util.Locale
import kotlin.math.max
import kotlin.math.min

@OptIn(ExperimentalTextApi::class)
@Composable
fun CandlestickChartCompose(
    candles: List<Candle>,
    timeframe: Timeframe,
    symbol: String,
    priceType: PriceType,
    drawings: List<Drawing>,
    activeDrawingTool: DrawingType?,
    selectedDrawingId: String?,
    alerts: List<PriceAlert> = emptyList(),
    onSelectDrawing: (String?) -> Unit,
    onAddDrawing: (Drawing) -> Unit,
    onUpdateDrawing: (Drawing) -> Unit,
    onSwipeNextCoin: () -> Unit = {},
    onSwipePreviousCoin: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var candleWidth by remember { mutableFloatStateOf(24f) }
    var scrollOffset by remember { mutableFloatStateOf(0f) }
    var priceScaleMultiplier by remember { mutableFloatStateOf(1f) }
    var crosshairPosition by remember { mutableStateOf<Offset?>(null) }

    val textMeasurer = rememberTextMeasurer()

    Box(
        modifier = modifier
            .background(TVBackground)
            .fillMaxSize()
            // 1-finger pan and 2-finger pinch zoom on chart
            .pointerInput(activeDrawingTool) {
                detectTransformGestures { _, pan, zoom, _ ->
                    scrollOffset += pan.x / candleWidth
                    candleWidth = (candleWidth * zoom).coerceIn(6f, 100f)
                }
            }
            .pointerInput(drawings, activeDrawingTool) {
                detectTapGestures(
                    onTap = { offset ->
                        crosshairPosition = offset
                    }
                )
            }
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val chartWidth = size.width - 150f // 150px price scale
            val chartHeight = size.height - 40f // 40px time scale

            if (candles.isEmpty()) return@Canvas

            val visibleCount = (chartWidth / candleWidth).toInt() + 2
            val endIndex = (candles.size - 1 + scrollOffset.toInt()).coerceIn(0, candles.size - 1)
            val startIndex = (endIndex - visibleCount).coerceAtLeast(0)

            val visibleCandles = candles.subList(startIndex, endIndex + 1)
            if (visibleCandles.isEmpty()) return@Canvas

            val minPrice = visibleCandles.minOf { it.low }
            val maxPrice = visibleCandles.maxOf { it.high }
            val priceRange = max(maxPrice - minPrice, maxPrice * 0.001f) * 1.1f / priceScaleMultiplier
            val midPrice = (maxPrice + minPrice) / 2f
            val displayMin = midPrice - priceRange / 2f
            val displayMax = midPrice + priceRange / 2f

            fun priceToY(price: Float): Float {
                return chartHeight - ((price - displayMin) / priceRange) * chartHeight
            }

            fun indexToX(idx: Int): Float {
                val offsetFromEnd = endIndex - idx
                return chartWidth - (offsetFromEnd + 0.5f) * candleWidth
            }

            // Draw grid lines
            val numSteps = 5
            for (i in 0..numSteps) {
                val p = displayMin + (priceRange / numSteps) * i
                val y = priceToY(p)
                drawLine(
                    color = TVBorder,
                    start = Offset(0f, y),
                    end = Offset(chartWidth, y),
                    strokeWidth = 1f
                )
                drawText(
                    textMeasurer = textMeasurer,
                    text = String.format(Locale.US, "%.2f", p),
                    topLeft = Offset(chartWidth + 8f, y - 10f),
                    style = TextStyle(color = TVTextSecondary, fontSize = 10.sp)
                )
            }

            // Draw Candlesticks
            for (i in startIndex..endIndex) {
                val c = candles[i]
                val x = indexToX(i)
                val isBull = c.close >= c.open
                val color = if (isBull) TVBullishGreen else TVBearishRed

                val openY = priceToY(c.open)
                val closeY = priceToY(c.close)
                val highY = priceToY(c.high)
                val lowY = priceToY(c.low)

                val bodyTop = min(openY, closeY)
                val bodyHeight = max(Math.abs(closeY - openY), 2f)
                val barW = max(candleWidth * 0.7f, 2f)

                // Wick
                drawLine(
                    color = color,
                    start = Offset(x, highY),
                    end = Offset(x, lowY),
                    strokeWidth = 2f
                )

                // Body
                drawRect(
                    color = color,
                    topLeft = Offset(x - barW / 2f, bodyTop),
                    size = Size(barW, bodyHeight)
                )
            }

            // Draw Active Alerts (Dotted horizontal lines + clean price scale label)
            val activeAlerts = alerts.filter { it.symbol == symbol && it.isEnabled && !it.isTriggered }
            activeAlerts.forEach { alert ->
                val alertY = priceToY(alert.targetPrice)
                if (alertY in 0f..chartHeight) {
                    val alertColor = Color(0xFFFF9800)
                    // Dotted line across chart
                    drawLine(
                        color = alertColor,
                        start = Offset(0f, alertY),
                        end = Offset(chartWidth, alertY),
                        strokeWidth = 1.5f,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(5f, 5f))
                    )
                    // Clean price badge on price scale (no unnecessary label/name)
                    drawRect(
                        color = alertColor,
                        topLeft = Offset(chartWidth, alertY - 11f),
                        size = Size(140f, 22f)
                    )
                    drawText(
                        textMeasurer = textMeasurer,
                        text = String.format(Locale.US, "%.2f", alert.targetPrice),
                        topLeft = Offset(chartWidth + 10f, alertY - 7f),
                        style = TextStyle(color = Color.Black, fontSize = 10.sp)
                    )
                }
            }

            // Draw User Drawings
            drawings.forEach { drawing ->
                val isSelected = drawing.id == selectedDrawingId
                val strokeW = if (isSelected) drawing.strokeWidth + 2f else drawing.strokeWidth

                when (drawing.type) {
                    DrawingType.HORIZONTAL_LINE -> {
                        val p = drawing.points.firstOrNull() ?: return@forEach
                        val y = priceToY(p.price)
                        drawLine(
                            color = Color(drawing.color),
                            start = Offset(0f, y),
                            end = Offset(chartWidth, y),
                            strokeWidth = strokeW,
                            pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f))
                        )
                    }
                    DrawingType.TRENDLINE -> {
                        if (drawing.points.size >= 2) {
                            val p1 = drawing.points[0]
                            val p2 = drawing.points[1]
                            val y1 = priceToY(p1.price)
                            val y2 = priceToY(p2.price)
                            val x1 = chartWidth - 100f
                            val x2 = chartWidth - 20f
                            drawLine(
                                color = Color(drawing.color),
                                start = Offset(x1, y1),
                                end = Offset(x2, y2),
                                strokeWidth = strokeW
                            )
                        }
                    }
                    DrawingType.RECTANGLE -> {
                        if (drawing.points.size >= 2) {
                            val y1 = priceToY(drawing.points[0].price)
                            val y2 = priceToY(drawing.points[1].price)
                            val top = min(y1, y2)
                            val h = Math.abs(y2 - y1)
                            drawRect(
                                color = Color(drawing.color).copy(alpha = 0.2f),
                                topLeft = Offset(50f, top),
                                size = Size(chartWidth - 100f, h)
                            )
                        }
                    }
                    DrawingType.PRICE_RANGE -> {
                        if (drawing.points.size >= 2) {
                            val y1 = priceToY(drawing.points[0].price)
                            val y2 = priceToY(drawing.points[1].price)
                            val top = min(y1, y2)
                            val h = Math.abs(y2 - y1)
                            val diff = drawing.points[1].price - drawing.points[0].price
                            val isGain = diff >= 0f
                            val rangeColor = if (isGain) TVBullishGreen else TVBearishRed
                            drawRect(
                                color = rangeColor.copy(alpha = 0.2f),
                                topLeft = Offset(50f, top),
                                size = Size(chartWidth - 100f, h)
                            )
                        }
                    }
                }
            }

            // Draw Live Price Line & Scale Tag
            val last = candles.last()
            val lastY = priceToY(last.close)
            val currentBull = last.close >= last.open
            val currentTagColor = if (currentBull) TVBullishGreen else TVBearishRed

            drawLine(
                color = currentTagColor,
                start = Offset(0f, lastY),
                end = Offset(chartWidth, lastY),
                strokeWidth = 1.5f,
                pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f))
            )

            // Price scale tag
            drawRect(
                color = currentTagColor,
                topLeft = Offset(chartWidth, lastY - 14f),
                size = Size(140f, 26f)
            )
            drawText(
                textMeasurer = textMeasurer,
                text = String.format(Locale.US, "%.2f", last.close),
                topLeft = Offset(chartWidth + 10f, lastY - 8f),
                style = TextStyle(color = Color.White, fontSize = 11.sp)
            )

            // Crosshair
            crosshairPosition?.let { pos ->
                if (pos.x in 0f..chartWidth && pos.y in 0f..chartHeight) {
                    drawLine(
                        color = Color.Gray,
                        start = Offset(pos.x, 0f),
                        end = Offset(pos.x, chartHeight),
                        strokeWidth = 1f,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 6f))
                    )
                    drawLine(
                        color = Color.Gray,
                        start = Offset(0f, pos.y),
                        end = Offset(chartWidth, pos.y),
                        strokeWidth = 1f,
                        pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 6f))
                    )
                }
            }
        }

        // Top HUD Header (Symbol, Timeframe, OHLC)
        if (candles.isNotEmpty()) {
            val last = candles.last()
            Row(
                modifier = Modifier
                    .padding(horizontal = 8.dp, vertical = 6.dp)
                    .align(Alignment.TopStart),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("$symbol · ${timeframe.displayName}", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Text("O: ${last.open}", color = TVTextSecondary, fontSize = 10.sp)
                Text("H: ${last.high}", color = TVTextSecondary, fontSize = 10.sp)
                Text("L: ${last.low}", color = TVTextSecondary, fontSize = 10.sp)
                Text("C: ${last.close}", color = if (last.close >= last.open) TVBullishGreen else TVBearishRed, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
        }

        // Bottom TradingView Swipe Navigation Strip
        // Allows horizontal swipe directly: Swipe Right-to-Left = Next Coin, Swipe Left-to-Right = Previous Coin
        var totalDragX by remember { mutableFloatStateOf(0f) }
        Surface(
            color = TVSurface.copy(alpha = 0.9f),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(30.dp)
                .pointerInput(activeDrawingTool) {
                    if (activeDrawingTool == null) {
                        detectDragGestures(
                            onDragStart = { totalDragX = 0f },
                            onDrag = { change, dragAmount ->
                                change.consume()
                                totalDragX += dragAmount.x
                            },
                            onDragEnd = {
                                if (totalDragX < -60f) {
                                    onSwipeNextCoin()
                                } else if (totalDragX > 60f) {
                                    onSwipePreviousCoin()
                                }
                                totalDragX = 0f
                            }
                        )
                    }
                }
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onSwipePreviousCoin,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(imageVector = Icons.Default.ChevronLeft, contentDescription = "Previous Coin", tint = TVTextSecondary)
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(imageVector = Icons.Default.SwapHoriz, contentDescription = null, tint = TVPrimaryBlue, modifier = Modifier.size(14.dp))
                    Text(
                        text = "Swipe to switch coin · $symbol",
                        color = TVTextSecondary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                IconButton(
                    onClick = onSwipeNextCoin,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(imageVector = Icons.Default.ChevronRight, contentDescription = "Next Coin", tint = TVTextSecondary)
                }
            }
        }
    }
}
