var lokale_json = JSON.parse(localStorage.getItem("lokale_json"));


$(function() {

        if (JSON.parse(localStorage.getItem("lokale_json")) == null) {
                $.getJSON("js/lokale.json", function (data) {
                        lokale_json = data;
                        localStorage.setItem("lokale_json", JSON.stringify(lokale_json));

                });
        }
        sort_lokale_postcode();
        lokaleList();

        //calculates the position of the user, then the distances of all places
        calculateDistances();

        //return to overview on swipe to right
        $( "#detail" ).on( "swiperight", returnHome);

        //list all places sorted by distance to your current position
        $('#list_by_distance').click(function() {
                sort_lokale_distance();
                listByDistance();

        } )

});

//functions go here!


// List all places sort by distance from current position

function listByDistance() {
        for (var key in lokale_json) {
                if (lokale_json.hasOwnProperty(key)) {
                        var lokal = lokale_json[key];
                        $('#list_view_distance').append('<li data-theme="d">'
                        + '<a href="#detail" data-transition="slide" onclick="getDetail(' + "'" + key + "'" + ')">'
                                //These quotation marks cost me an hour of my life I won't get back and
                                // are apparently necessary for the function to accept a String
                        + lokal.name
                        + '</a>'
                        + '<span class="ui-li-count">'
                        + Number((lokal.distanceToCurrPos).toFixed(2)) + ' km'
                        + '</span>'
                        + '</li>');
                }
        }
        $("#list_view_distance").listview("refresh");
}


//Lists all places sorted by post code

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

        //thanks stackoverflow: collapsible divider magic

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


        // call list view refresh, so that the list looks nice!
        // don't call it on every single list item or the list will take a minute to load.
        $("#lokalelist").listview("refresh");

}

//Updates Detail View with the place's details like name, adress, website

function getDetail(id) {
        var lokal_id = id;
        var lat = lokale_json[lokal_id].latitude;
        var long = lokale_json[lokal_id].longitude;
        // works! console.log(long, lat);
        $('#rest_name').html(lokale_json[lokal_id].name);
        $('#address').html(lokale_json[lokal_id].address + '<br>' +
        lokale_json[lokal_id].postcode + ' ' +
        lokale_json[lokal_id].city);
        $('#further').html(lokale_json[lokal_id].details);

        createMap(lokal_id);

       $('#website').html(getURL(lokal_id));

}

//creates the map view on the detail page

function createMap(id) {

        //map parameters according to static google map api

        var mapsUrl = "https://maps.googleapis.com/maps/api/staticmap?";
        var zoom = 14;
        var size = "320x400";
        var markers = "color:blue%7C" + lokale_json[id].latitude + "," + lokale_json[id].longitude;
        var maptype = "roadmap";

        //putting together map url and passing it as a src attribute inside an img tag
        $('#minimap').html("<img src='" + mapsUrl + "size=" + size + "&markers=" + markers + "&zoom=" + zoom +  "'/>");

}

// sorts the lokale_json array based on postcode
function sort_lokale_postcode() {
        lokale_json.sort(comparator);
}

function comparator(a, b) {
        //this sorts the array of JSON objects by postcode.
        return parseInt(a["postcode"]) - parseInt(b["postcode"]);
}

// sorts the lokale json array based on distance to current position. hopefully eventually
function sort_lokale_distance() {
        lokale_json.sort(comparator_distance);
}

function comparator_distance(a, b) {
        //this sorts the array of JSON objects by distance to current location
        return parseFloat(a['distanceToCurrPos']) - parseFloat(b['distanceToCurrPos']);
}

function calculateDistances() {
        var geoError;
        if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                        positionCallback(position);
                });
        } else {
                geoError = "Geolocation is not supported by this browser.";
                return geoError;
        }
}

function positionCallback(position) {
        var myLat = position.coords.latitude;
        var myLong = position.coords.longitude;
        //create google Position object
        //var originPosition = new google.maps.LatLng(myLat,myLong);

        // call calc distance function and save the calculated distance into a newly created attribute
        // called distanceToCurrPos in the json array
        for (var key in lokale_json) {
                if (lokale_json.hasOwnProperty(key)) {
                        var distance = getDistanceFromLatLonInKm(myLat, myLong, lokale_json[key].latitude, lokale_json[key].longitude);
                        lokale_json[key].distanceToCurrPos = distance;
                }
        }
}


//Google Maps API function
function calculateWalkingDistance(lokalPosition) {
        var destination = new google.maps.LatLng(lokalPosition.lat, lokalPosition.long);
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
            {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: google.maps.TravelMode.WALKING,
                    unitSystem: google.maps.UnitSystem.METRIC
            }, callback);

        function callback(response, status) {
                if (status == google.maps.DistanceMatrixStatus.OK) {
                var result = response.rows[0].elements;
                var distance = result.distance.text;
                return distance;
                }
        }
}

//calc distance as the crow flies

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
}

function deg2rad(deg) {
        return deg * (Math.PI/180)
}

function returnHome() {
        window.history.back().lokaleList().listview("refresh");
}

// holy shit, this is some convoluted parsing mess
// this function finds a string inside the details field starting with www.
// then it finds the next blank, comma or new line after the www.
// if there is none, then it takes everything from www. until the end of details
// else it looks at the position of the first blank, comma or new line and takes the smallest number
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

        return buildWebsiteLink(finalURL);

}

// take the URL and surround it with HTML but only if there is a URL present
// uses inapp browser plugin (3rd party plugin)

function buildWebsiteLink(url) {
        if (url.length > 1) {
                // divided up into three lines because of quotation mark confusion
                var realURL = "http://" + url;
                var inAppBrowser = "var ref = window.open('http://" + url + "', '_blank', 'location=yes,toolbar=yes');"
                return '<a id="pageURL" href="#" onclick="' + inAppBrowser + '">Restaurant Website</a>';
        } else {
                return null;
        }
}