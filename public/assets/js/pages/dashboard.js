function initDashboardCharts() {
    if (typeof ApexCharts === "undefined") return;

    var statEl = document.querySelector("#statistics-chart");
    if (statEl) {
        var colors = ["#777edd", "#0acf97", "#fa5c7c", "#f9bc0b"];
        var dataColors = statEl.getAttribute("data-colors");
        var statOptions = {
            series: [
                { name: "Open Campaign", type: "bar", data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.57, 92.57, 42.36, 88.51, 36.57] },
                { name: "Marketing Cost", type: "bar", data: [30.28, 33.45, 50, 31.12, 26.59, 34.06, 39.79, 14.38, 33.44, 48.12, 27.91, 23.91] }
            ],
            chart: { height: 301, type: "line", toolbar: { show: false } },
            stroke: { width: 0, curve: "straight" },
            plotOptions: { bar: { columnWidth: "45%", barHeight: "70%", borderRadius: 5 } },
            xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
            colors: dataColors ? dataColors.split(",") : colors
        };
        new ApexCharts(statEl, statOptions).render();
    }

    var revEl = document.querySelector("#revenue-chart");
    if (revEl) {
        var revColors = ["#777edd", "#0acf97", "#fa5c7c", "#f9bc0b"];
        var revDataColors = revEl.getAttribute("data-colors");
        var revOptions = {
            series: [
                { name: "Total Income", data: [82, 85, 70, 90, 75, 78, 65, 50, 72, 60, 80, 70] },
                { name: "Total Expenses", data: [30, 32, 40, 35, 30, 36, 37, 28, 34, 42, 38, 30] }
            ],
            stroke: { width: 2, curve: "straight" },
            chart: { height: 299, type: "area", zoom: { enabled: false }, toolbar: { show: false } },
            dataLabels: { enabled: false },
            xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
            colors: revDataColors ? revDataColors.split(",") : revColors,
            tooltip: {
                shared: true,
                y: [
                    { formatter: function(o) { return void 0 !== o ? "$" + o.toFixed(2) + "k" : o; } },
                    { formatter: function(o) { return void 0 !== o ? "$" + o.toFixed(2) + "k" : o; } }
                ]
            }
        };
        new ApexCharts(revEl, revOptions).render();
    }

    var visitEl = document.querySelector("#data-visits-chart");
    if (visitEl) {
        var visitColors = ["#777edd", "#45bbe0", "#0acf97", "#fa5c7c", "#e3eaef"];
        var visitDataColors = visitEl.getAttribute("data-colors");
        var visitOptions = {
            chart: { height: 335, type: "donut" },
            series: [25, 40, 30, 15, 20],
            legend: { show: true, position: "bottom", horizontalAlign: "center", verticalAlign: "middle", floating: false, fontSize: "14px", offsetX: 0, offsetY: 7 },
            labels: ["10-16 (Child)", "18-26 (Young)", "27-35 (Adult)", "36-50 (Middle Age)", "51+ (Senior)"],
            colors: visitDataColors ? visitDataColors.split(",") : visitColors,
            responsive: [{ breakpoint: 600, options: { chart: { height: 240 }, legend: { show: false } } }]
        };
        new ApexCharts(visitEl, visitOptions).render();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboardCharts);
} else {
    initDashboardCharts();
}
