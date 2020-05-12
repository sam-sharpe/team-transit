const sheet_id = "1pOtKrITBGcX-J49M4Ftul2PhpnT5asB0a4omqbCJTxs";
const sheets = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"J",
	"L",
	"M",
	"N",
	"Q",
	"R",
	"S",
	"W",
	"Z"
];

let data;

$(document).ready(function () {
  const line_options = ["Choose a line"].concat(sheets).map(line => `<option value="${line}">${line}</option>`);
  $("select.line").html(line_options.join(""));
});

$("body").on("change", "select.line", function (e) {
  const this_select = $(e.target);
  const line = this_select.val();
  const sheet_num = (sheets.indexOf(line) + 2);
  const url = `https://spreadsheets.google.com/feeds/list/${sheet_id}/${sheet_num}/public/full?alt=json`;
  fetch(url).then(r => r.json()).then(d => {
    console.log(url);
    console.log(data);
    data = d.feed.entry;
    buildDropdowns();
  });
});

function buildDropdowns() {
  const options = data.map(station => `
		<option class='${(station.gsx$accessibility.$t.toLowerCase() === "yes") ? 'accessible' : 'non-accessible'}'
		value='${station.gsx$station.$t}'
		data-access='${station.gsx$nearbyaccessible.$t}'>${station.gsx$station.$t}</option>`);

  options.unshift("<option value=''></option>");
  $(".start select, .end select").html(options.join(""));
  $(".start, .end").addClass("active");
}

$("body").on("change", ".start select, .end select", function (e) {
  const start_station = $(".start select").val();
  const end_station = $(".end select").val();


  if (start_station !== "" && end_station !== "") {
    // do the results stuff
    const start_station_option = $(`.start select option[value='${start_station}']`);
    const end_station_option = $(`.end select option[value='${end_station}']`);

    const start_accessible = start_station_option.hasClass("accessible");
    const end_accessible = end_station_option.hasClass("accessible");

    let message = [];
    let className = "accessible";

    if (start_accessible === true && end_accessible === true) {
      message.push("Woohoo! Your trip is completely accessible!");
    } else {
      className = "non-accessible";
      message.push("Sorry,");
    }

    if (start_accessible === false) {
      message.push(`${start_station} is not ADA-compliant. You can try going to ${start_station_option.data("access")} station.`);
    }

    if (end_accessible === false) {
      message.push(`${end_station} is not ADA-compliant. You can try going to ${end_station_option.data("access")} station.`);
    }

    $("#result").removeClass("accessible non-accessible");
    $("#result").addClass(className);
    $("#result p").text(message.join(" "));
  }
});