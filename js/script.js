/**
 * Created by verenka on 28/05/15.
 */
var lokale = [];

$(function() {
    //Parsing the data from the table of non smoking bars etc.
    //for each table row
/*    $("table tr").each(function() {

        //extract data per row and save into attributes
        var name = $( "tr td:first-child" ).text();
        var address = $( "tr td:nth-child(2)").text();
        var latlong = $("a[title=' Lageplan ']").attr('onclick');
        var latitude = latlong.substring(22, 31);
        var longitude = latlong.substring(35, 44);
        //quick test
        console.log(latitude);
        console.log(longitude);

        //build JSON Object and fill array
        var object = {"name": name, "address": address, "latitude": latitude, "longitude": longitude };

        //save array into local storage
        lokale[lokale.length] = object;
    });*/

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
