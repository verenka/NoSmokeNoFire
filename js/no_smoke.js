var lokale_json = [];

$(function() {

        $.getJSON("js/lokale.json", function (data) {
                lokale_json = data;
                sort_lokale();
                lokaleList();
        });

});

//functions go here!

function lokaleList() {

        for (var key in lokale_json) {

                if (lokale_json.hasOwnProperty(key)) {
                        var lokal = lokale_json[key];
                        $('#lokalelist').append('<li data-theme="d" postcode="'+ lokal.postcode +'">'
                        + '<a href="#detail" data-transition="slide" onclick="getDetail(' + "'" + key + "'" + ')">'
                                //These quotation marks cost me an hour of my life I won't get back and
                                // are apparently necessary for the function to accept a String
                        + lokal.name
                        + '</a>'
                            // this here causes the auto-dividers by postcode to work
                            // now that it works i want collapsible ones!
                        + '</li>').listview({
                                autodividers: true,
                                autodividersSelector: function (li) {
                                        var out = li.attr("postcode");
                                        return out;
                                }
                        });
                }
        }

        //call list view refresh, so that the list looks nice!
        // don't call it on every single list item or the list will take a minute to load.

        $("#lokalelist").listview("refresh");
}

function getDetail(id) {
        $('#rest_name').html(lokale_json[id].name);
        $('#address').html(lokale_json[id].address + '<br>' +
        lokale_json[id].postcode + ' ' +
        lokale_json[id].city);
        $('#further').html(lokale_json[id].details);

        createMap(id);


        // TO DO: Parse url out of details field and append to $('#website')...
}
function createMap(id) {

        //map parameters according to static google map api

        var mapsUrl = "https://maps.googleapis.com/maps/api/staticmap?";
        var zoom = 14;
        var size = "500x400";
        var markers = "color:blue%7C" + lokale_json[id].latitude + "," + lokale_json[id].longitude;
        var maptype = "roadmap";

        //putting together map url and passing it as a src attribute inside an img tag
        $('#minimap').html("<img src='" + mapsUrl + "size=" + size + "&markers=" + markers + "&zoom=" + zoom +  "'/>");

}

function sort_lokale() {
        lokale_json.sort(comparator);
}

function comparator(a, b) {
        //this sorts the array of JSON objects by postcode.
        return parseInt(a["postcode"]) - parseInt(b["postcode"]);
}