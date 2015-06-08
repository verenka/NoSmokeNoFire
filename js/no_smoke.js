var lokale_json = [];

$(function() {

        $.getJSON("js/lokale.json", function (data) {
                lokale_json = data;
                sort_lokale();
                lokaleList();
        });

        //return to overview on swipe to right
        $( "#detail" ).on( "swiperight", returnHome);

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

                        //code from stackoverflow
                        //puts collapsible functionality before the divider div
                        //icons don't show up yet, though

                        var ic = '<div class="ui-icon ui-icon-minus dividerIcon">&nbsp;</div>';
                        $(".ui-li-divider").prepend(ic);
                        $(".dividerIcon").addClass("divIconPos");
                }
        }

        //thanks stackoverflow:

        $(document).on("click", '.ui-li-divider, .dividerIcon', function(e){
                var IsCollapsed = false;
                var TheDivider = $(this);
                if ($(this).hasClass('dividerIcon')){
                        TheDivider = $(this).parents('.ui-li-divider');
                }

                var li = TheDivider.next(':not(.ui-li-divider)');
                while ( li.length > 0 ) {
                        IsCollapsed = li.css('display') == 'none';
                        li.toggle();
                        li = li.next(':not(.ui-li-divider)');
                }

                if (!IsCollapsed){
                        TheDivider.find('.dividerIcon').removeClass('ui-icon-minus').addClass('ui-icon-plus');
                }else{
                        TheDivider.find('.dividerIcon').removeClass('ui-icon-plus').addClass('ui-icon-minus');
                }
                e.stopPropagation();
                return false;
        });


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

        $('#website').attr("href", "http://" + getURL(id));
        //TO DO: Remove Website where there is no URL!
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


// Callback function references the event target and adds the 'swiperight' class to it
function returnHome() {
        window.history.back().listview("refresh");
        // $("#lokalelist").listview("refresh"); --> doesn't appear to make a difference
}

// holy shit, this is some convoluted parsing mess
// this function finds a string inside the details field starting with www.
// then it finds the next blank, comma or new line after the www.
// if there is none, then it takes everything from www. until the end of details
// else it looks at the position of the first blank, comma and new line and takes the smallest number
// and the url is that number of letters, starting from www.

function getURL(id) {
        var details = lokale_json[id].details;
        var details_length = details.length;
        var url_start_position = details.indexOf("www.");
        var details_from_www = details.substr(url_start_position, details_length-url_start_position);
        var blank = details_from_www.indexOf(" ");
        var comma = details_from_www.indexOf(",");
        var new_line = details_from_www.indexOf("\n");
        my_array = [];
        if (blank > -1) {
                my_array[my_array.length]= blank;
        }
        if (comma > -1) {
                my_array[my_array.length] = comma;
        }
        if (new_line > -1) {
                my_array[my_array.length] = new_line;
        }

        var finalURL;
        if (my_array == null) {
                finalURL = details.substr(url_start_position, details_length-url_start_position);
        } else {
                finalURL = details.substr(url_start_position, Math.min.apply(Math, my_array));
        }

        return finalURL;
}