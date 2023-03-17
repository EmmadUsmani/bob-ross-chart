import * as d3 from "d3"
import type { DSVParsedArray } from "d3"

type Row = {
  paintingNumber: number
  numColors: number
}

const WIDTH = window.innerWidth * 0.9
const HEIGHT = window.innerHeight * 0.9
const TOP_MARGIN = 15
const RIGHT_MARGIN = 15
const BOTTOM_MARGIN = 40
const LEFT_MARGIN = 60
const BOUNDED_WIDTH = WIDTH - LEFT_MARGIN - RIGHT_MARGIN
const BOUNDED_HEIGHT = HEIGHT - TOP_MARGIN - BOTTOM_MARGIN

function yAccessor(row: Row) {
  return row.numColors
}

function xAccessor(row: Row) {
  return row.paintingNumber
}

function getYScale(data: DSVParsedArray<Row>) {
  const yExtent = d3.extent(data, yAccessor).map((value) => value || 0)
  return d3.scaleLinear().domain(yExtent).range([BOUNDED_HEIGHT, 0])
}

function getXScale(data: DSVParsedArray<Row>) {
  const xExtent = d3.extent(data, xAccessor).map((value) => value || 0)
  return d3.scaleLinear().domain(xExtent).range([0, BOUNDED_WIDTH])
}

async function drawLineChart() {
  const data = await d3.csv<Row>("./data.csv", (row) => ({
    paintingNumber: parseInt(row[""] || "0"),
    numColors: parseInt(row.num_colors || "0"),
  }))

  // Draw canvas
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
  const bounds = wrapper
    .append("g")
    .style("transform", `translate(${LEFT_MARGIN}px, ${TOP_MARGIN}px)`)

  // Create scales
  const yScale = getYScale(data)
  const xScale = getXScale(data)

  // Draw data
  const lineGenerator = d3
    .line<Row>()
    .x((row) => xScale(xAccessor(row)))
    .y((row) => yScale(yAccessor(row)))
  const line = bounds
    .append("path")
    .attr("d", lineGenerator(data))
    .attr("fill", "none")
    .attr("stroke", "LightSeaGreen")
    .attr("stroke-width", 1.5)

  // Draw peripherals
  const yAxisGenerator = d3.axisLeft(yScale)
  const yAxis = bounds.append("g").call(yAxisGenerator)

  const xAxisGenerator = d3.axisBottom(xScale)
  const xAxis = bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${BOUNDED_HEIGHT}px)`)
}

drawLineChart()
