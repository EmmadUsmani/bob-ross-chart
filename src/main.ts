import * as d3 from "d3"
import type { DSVParsedArray } from "d3"

type Row = {
  paintingNumber: number
  numColors: number
}

type Dimensions = {
  width: number
  height: number
  topMargin: number
  rightMargin: number
  bottomMargin: number
  leftMargin: number
  boundedWidth: number
  boundedHeight: number
}

function getDimensions(widthRatio: number = 0.9, heightRatio: number = 0.9) {
  const width = window.innerWidth * widthRatio
  const height = window.innerHeight * heightRatio
  const topMargin = 15
  const rightMargin = 15
  const bottomMargin = 40
  const leftMargin = 60
  const boundedWidth = width - leftMargin - rightMargin
  const boundedHeight = height - topMargin - bottomMargin

  return {
    width,
    height,
    topMargin,
    rightMargin,
    bottomMargin,
    leftMargin,
    boundedWidth,
    boundedHeight,
  } as Dimensions
}

function getData() {
  return d3.csv<Row>("./data.csv", (row) => ({
    paintingNumber: parseInt(row[""] || "0"),
    numColors: parseInt(row.num_colors || "0"),
  }))
}

function yAccessor(row: Row) {
  return row.numColors
}

function xAccessor(row: Row) {
  return row.paintingNumber
}

function getYScale(data: DSVParsedArray<Row>, dimensions: Dimensions) {
  const yExtent = d3.extent(data, yAccessor).map((value) => value || 0)
  return d3.scaleLinear().domain(yExtent).range([dimensions.boundedHeight, 0])
}

function getXScale(data: DSVParsedArray<Row>, dimensions: Dimensions) {
  const xExtent = d3.extent(data, xAccessor).map((value) => value || 0)
  return d3.scaleLinear().domain(xExtent).range([0, dimensions.boundedWidth])
}

async function drawLineChart() {
  const dimensions = getDimensions(0.95, 0.95)
  const data = await getData()

  // Draw canvas
  const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)
  const bounds = wrapper
    .append("g")
    .style(
      "transform",
      `translate(${dimensions.leftMargin}px, ${dimensions.topMargin}px)`
    )

  // Create scales
  const yScale = getYScale(data, dimensions)
  const xScale = getXScale(data, dimensions)

  // Draw data
  const lineGenerator = d3
    .line<Row>()
    .x((row) => xScale(xAccessor(row)))
    .y((row) => yScale(yAccessor(row)))
  bounds
    .append("path")
    .attr("d", lineGenerator(data))
    .attr("fill", "none")
    .attr("stroke", "LightSeaGreen")
    .attr("stroke-width", 1.5)

  // Draw peripherals
  const yAxisGenerator = d3.axisLeft(yScale)
  bounds.append("g").call(yAxisGenerator)

  const xAxisGenerator = d3.axisBottom(xScale)
  bounds
    .append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
}

drawLineChart()
