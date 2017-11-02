myApp.onPageBeforeInit('dontesrefak', function (page) {
    $("#falista").html("");
    currentPage = "dontesrefak";
    var trees, items = [];
    $.getJSON(apiaddress + "?action=FelvittLista&auth_token=" + authenticate.auth_token + "&neptun=" + authenticate.neptun + "&szektor=" + authenticate.szektor + "&utca=" + authenticate.utca + "&felev=" + authenticate.felev+'&action2=piszkozat', function (data) {
        console.log("asd");
        if (data.trees.length == 0) {
            items.push('<li><div class="item-content"> <div class="item-media"> <i class="glyphicon glyphicon-cloud"></i></div> <div class="item-inner"> <a href="#" class="button disabled" style="font-weight: 800;color: black;">' + data.message + '</a> </div> </div> </li>');
        } else {
            $("#fanumber2").html("(" + data.trees.length + " db)");
            $.each(data.trees, function (key, val) {

                var a = new Date(val.created_by * 1000);
                var months = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
                var year = a.getFullYear();
                var month = months[a.getMonth()];
                var date = a.getDate();
                var hour = a.getHours();
                var min = a.getMinutes();
                var sec = a.getSeconds();

                var faid = '' + val.szektor_id + '' + val.utca_id + '' + val.fa_egyedi_id;
                //Hanyadik console.log(key);
                items.push('<hr>');
                items.push('<li>' +
                    '<a href="#" class="item-link item-content">' +
                    '<div class="item-media"><img src="' + apiaddress + '' + val.image1 + '" width="80"></div>' +
                    '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                    '<div class="item-title">Döntésre vár...</div>' +
                    '<div class="item-title">' + faid + '</div>' +
                    '</div>' +
                    '<div class="item-subtitle">' + val.json.utcanev + ' ' + val.json.hazszam + '</div>' +
                    '<div class="item-text">Rögzítette: ' + val.nev + '<br>' +
                    'Rögzítve: ' + year + '/' + month + '/' + date + ' ' + hour + ':' + min + '' +
                    '</div>' +
                    '</div>' +
                    '</a>' +
                    '</li>');

            });
        }
        $("#falista2").html(items.join(""));
    });

});
