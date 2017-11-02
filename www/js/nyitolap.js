myApp.onPageBeforeAnimation('nyitolap', function (page) {
    currentPage = "nyitolap";
    var sidebar = '' +
        '<div class="list-block">' +
        '<ul>' +
        '<li><span class="list-button"><i class="glyphicon glyphicon-user"></i> ' + user.name + '</span></li>' +
        '<hr>' +
        '<li><a href="farogzites.html" class="list-button item-link"><i class="glyphicon glyphicon-plus"></i> Új fa rögzítése</a></li>' +
        '<li><a href="rogzitettfak.html" class="list-button item-link"><i class="glyphicon glyphicon-floppy-saved"></i> Rögzített fák</a></li>' +
        '<li><a href="dontesrefak.html" class="list-button item-link"><i class="glyphicon glyphicon-floppy-remove"></i> Döntésre váró fák</a></li>' +
        '<hr>' +
        '<li><a href="nyitolap.html" class="list-button item-link"><i class="glyphicon glyphicon-globe"></i> Nyitólap</a></li>' +
        '<li><a href="adategyeztetes2.html" class="list-button item-link"><i class="glyphicon glyphicon-cog"></i> Adategyeztetés</a></li>' +
        '<li id="menuLogout"><a href="#" class="list-button item-link"><i class="glyphicon glyphicon-off"></i> Kijelentkezés</a></li>' +
        '<hr>' +
        '<li><a href="kapcsolat.html" class="list-button item-link"><i class="glyphicon glyphicon-envelope"></i> Kapcsolat</a></li>' +
        '</ul>' +
        '';
    $("#left-block").html(sidebar);
    $("li").off('click').on("click", function () {
        myApp.closePanel();
    });
    $("#menuLogout").off('click').on("click", function () {
        myApp.confirm("Biztos szeretne kijelentkezni? A nem mentett adatok elvesznek!", "Kijelentkezés megerősítése", function () {
            $.ajax(apiaddress+"?action=Login&action2=logout&auth=" + authenticate.auth_token + "&neptun=" + authenticate.neptun + "&felev=" + authenticate.felev)
                .done(function (replyLogout) {
                    if (replyLogout.code == 1) {
                        logout();
                        mainView.router.loadPage('login.html');
                        myApp.closePanel();
                    }
                });
        }, function () {
        });
    });
});

myApp.onPageBeforeAnimation('nyitolap', function (page) {
    if (device.platform.toLowerCase() == "android") {
        cordova.plugins.diagnostic.isGpsLocationEnabled(function (enabled) {
            if (!enabled) {
                myApp.alert("Kérlek engedélyezd a GPS-t a telefonodon. GPS nélkül az alkalmazás használhatatlan!", "A GPS elengedhetetlen", function () {
                    back(true);
                })
            }
        }, function (error) {
            myApp.alert("The following error occurred: " + error, "Hiba");
        });
    }

    $("#nameAltalanos").html(user.name);
    $("#emailAltalanos").html(user.email);
    $("#neptunAltalanos").html(authenticate.neptun);
    $("#felevAltalanos").html(authenticate.felev);
    $("#szektorAltalanos").html(authenticate.szektor);
    $("#utcaAltalanos").html(authenticate.utca);
    $("#versionAltalanos").html(server.version);
    $("#offlineAltalanos").html(server.offlinemode ? "Offline mód támogatott, internetkapcsolat nem szükséges csak a szinkronizáláshoz, amikor a változtatások felkerülnek a szerverre." : "Az offline mód jelenleg nem engedélyezett, a szoftver használatához folyamatos, de minimális internetkapcsolat szükséges.");
    $("#felevStatusAltalanos").html(authenticate.felevStatus ? "Aktív" : "Archivum");
    $("#felevInformaciokAltalanos").html(authenticate.felevInformaciok != "null" ? authenticate.felevInformaciok : "Jelenleg nincsenek kihirdetve információk a félévvel kapcsolatban.");
});