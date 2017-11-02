var kapcsolat = [
    {
        pozicio: 'Vezető Fejlesztő',
        name: 'Szarka Alex',
        email: 'szarka@inf.u-szeged.hu',
        web: 'https://irinyi.cloud',
        desc: 'A fejlesztési stratégiák kidolgozója és a fejlesztési döntéshozó'
    },
    {
        pozicio: 'Fejlesztő',
        name: 'Polynár Dávid',
        email: 'polynar.david@gmail.com',
        web: '',
        desc: 'A teljes Webfelületért felelős személy'
    },
    {
        pozicio: 'Fejlesztő',
        name: 'Schwan Krisztián',
        email: 'Schwan.Krisztian@stud.u-szeged.hu',
        web: '',
        desc: 'Hibák és üzemzavarok elhárításáért felelős személy'
    },
    {
        pozicio: 'Oktató',
        name: 'Dr. Gulyás Ágnes',
        email: 'agulyas@geo.u-szeged.hu',
        web: 'http://www2.sci.u-szeged.hu/eghajlattan/gulyas.htm',
        desc: 'A kurzus oktatója, ha a tárggyal kapcsolatban kérdésed vagy problémád merül fel vele kell felvenni a kapcsolatot'
    },
    {
        pozicio: 'Tutor',
        name: 'Győri Zsuzsa',
        email: 'gyorizsa@gmail.com',
        web: 'http://www2.sci.u-szeged.hu/eghajlattan/gyori_zs.htm',
        desc: 'Amennyiben segítségre van szükséged, elakadsz vagy valamit nem tudsz, akkor neki írd meg a kérdésedet'
    },
    {
        pozicio: 'Tutor',
        name: 'Csete Ákos Kristóf',
        email: '',
        web: '',
        desc: 'A kurzus végén a helyszíni, digitális térképi adatrögzítési folyamatot vezető személy'
    }
];
myApp.onPageBeforeInit('kapcsolat', function (page) {
    currentPage = "kapcsolat";
    var items = [];
    $.each(kapcsolat, function (key, val) {
        items.push('<hr>');
        items.push('<li><div class="item-content"><b>' + val.pozicio + '</b></div></li>');
        items.push('<li><div class="item-content"> <div class="item-media"> <i class="glyphicon glyphicon-user"></i></div> <div class="item-inner"> <a href="#" class="button disabled" style="font-weight: 800;color: black;">' + val.name + '</a> </div> </div> </li>');
        if (val.email != null && val.email.length > 0)
            items.push('<li><div class="item-content"> <div class="item-media"> <i class="glyphicon glyphicon-envelope"></i></div> <div class="item-inner"> <a href="#" class="button disabled" style="font-weight: 800;color: black;">' + val.email + '</a> </div> </div> </li>');
        if (val.web != null && val.web.length > 0)
            items.push('<li><div class="item-content"> <div class="item-media"> <i class="glyphicon glyphicon-globe"></i></div> <div class="item-inner"> <a href="#" onclick="window.open(\'' + val.web + '\', \'_system\');" class="button button-fill button-raised">Weboldal megnyitása</a> </div> </div> </li>');
        if (val.desc != null && val.desc.length > 0)
            items.push('<li><div class="item-content"><div class="item-media"></div><div class="item-inner">' + val.desc + '</div></div></li>');

    });
    $("#kozremukodok").html(items.join(""));

});
