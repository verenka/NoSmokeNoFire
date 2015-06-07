/**
 * Created by verenka on 28/05/15.
 */
var lokale = [];

$(function() {
    //Parsing the data from the table of non smoking bars etc. copied table #someid manually from
    // http://www.nichtraucherlokale.net/index1.php into nichtraucherlokale_at.html
    // this isn't pretty but Access-Control-Allow-Origin prevents me from accessing directly

    var table = document.getElementById('mytable'),
        rows = table.getElementsByTagName('tr'),
        i, j, cells, customerId, name, address, link, latitude, longitude, object, countrycode, postcode, city, myString, details;

    for (i = 0, j = rows.length; i < j; ++i) {
        cells = rows[i].getElementsByTagName('td');
        if (!cells.length) {
            continue;
        }
        name = cells[0].textContent;
        address = cells[1].textContent;
        countrycode = cells[2].textContent;
        postcode = cells[3].textContent;
        city = cells[4].textContent;
        details = cells[5].textContent;

        //complicated getting of the onclick attribute in the link inside second table cell
        link = cells[1].getElementsByTagName("a")[0];
        myString = link.getAttribute('onclick');
        latitude = myString.substr(myString.indexOf("bg=")+3, 9);
        longitude = myString.substr(myString.indexOf(("lg="))+3, 9);

        //build JSON Object of bar/café / restaurant
        object = {"name": name, "address": address, "postcode": postcode, "city": city, "countrycode": countrycode, "latitude": latitude, "longitude": longitude, "details": details };

        //save array into local storage
        lokale[lokale.length] = object;
    }

    $("#dump").html(JSON.stringify(lokale));

});
