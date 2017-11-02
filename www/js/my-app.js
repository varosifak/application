var client_version;
var apiaddress = "https://irinyi.cloud/varosifak/api/";
var server = {
    version: null,
    maintenance: null,
    offlinemode: false,
    map: false
};
var currentPage = null;

var jqueryLoaded = false;

var myApp = new Framework7({
    //swipePanel: 'left',
    material: true
});
var ready = 0;
var db;
var loadingTextLabel = $("#loadingText");

var authenticate = {
    auth_token: null,
    neptun: null,
    szektor: null,
    utca: null,
    utcanev: null,
    felev: null,
    felevStatus: false,
    felevInformaciok: null
};

var user = {
    name: null,
    email: null
};

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

window.onload = function () {
    document.addEventListener("deviceready", onDeviceReady, false);
    cordova.getAppVersion.getVersionNumber(function (version) {
        client_version = version;
    });
};
function initMap() {
    server.map = true;
}
function onBackKeyDown() {
    back(false);
}

function back(close) {
    close = close || false;
    if (close) {
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        } else {
            window.close();
        }
    }

    if (currentPage == "farogzites") {
        var pop = farogzitVerem.pop();
        if (pop == 1) {
            myApp.confirm("Az eddig beírt adatok, melyeket még nem küldtél be elvesznek! Biztos visszalépsz még egyet?", "Adatvesztés", function () {
                mainView.router.back();
            }, function () {
                farogzitVerem.push(1);
            });
        } else {
            $("#step_" + pop).hide(function () {
                $("#step_" + (farogzitVerem[farogzitVerem.length - 1])).show();
                eval("step" + (farogzitVerem[farogzitVerem.length - 1]) + '()');
            });
        }
    } else {
        mainView.router.back();
    }
}

$(document).ready(function () {
    jqueryLoaded = true;
    loadingTextLabel.html("jQuery betöltve");
});

function onDeviceReady() {
    loadingTextLabel.html("jQuery betöltése");
    if (!jqueryLoaded) {
        setTimeout(function () {
            onDeviceReady();
        }, 500);
    }
    loaded();
}

myApp.onPageBeforeAnimation('login', function (page) {
    currentPage = "login";
});
var utcanevek = new Array();
myApp.onPageInit('login', function (page) {
    myApp.showPreloader('Utcák betöltése...');
    $.getJSON(apiaddress+"?action=SzektorUtca", function (data) {
        myApp.hidePreloader();
        var items = [];
        items.push("<option selected disabled>Kérlek válassz</option>");
        $.each(data, function (key, val) {
            utcanevek[val.szektor_kod + "" + val.utca_kod] = val.utca_nev;
            items.push("<option value='" + val.szektor_kod + "/" + val.utca_kod + "'>" + val.utca_nev + "</option>");
        });
        $("#szektorutca").html(items.join(""));
    });

    $.getJSON(apiaddress+"?action=Idoszakok", function (data) {
        var items = [];
        items.push("<option selected disabled>Kérlek válassz</option>");
        $.each(data, function (key, val) {
            items.push("<option value='" + val.felev + "'>" + val.felev + "</option>");
        });
        $("#felev").html(items.join(""));
    });
    var sidebar = '' +
        '<div class="list-block">' +
        '<ul>' +
        '<li><span class="list-button"><i class="glyphicon glyphicon-user"></i> Jelentkezz be</span></li>' +
        '</ul>' +
        '';
    $("#left-block").html(sidebar);
    $("#loginForm").submit(function (event) {
        myApp.showPreloader('Bejelentkezés...');
        $('#loginButton').attr('disabled', 'disabled');
        event.preventDefault();
        var data = $("#loginForm").serialize();
        var $form = $(this),
            url = $form.attr('action');
        var posting = $.post(url, data);

        posting.done(function (data) {
            myApp.hidePreloader();
            if (data.code == 0) {
                $('#loginButton').removeAttr('disabled');
                myApp.alert(data.modal.text, data.modal.title);
            } else {
                window.localStorage.setItem("auth_token", data.auth_token);
                window.localStorage.setItem("neptun", data.neptun);
                window.localStorage.setItem("szektor", data.szektor);
                window.localStorage.setItem("utca", data.utca);
                window.localStorage.setItem("utcanev", utcanevek[data.szektor + "" + data.utca]);
                window.localStorage.setItem("felev", data.felev);
                window.localStorage.setItem("felevStatus", data.felevStatus);
                window.localStorage.setItem("felevInformaciok", data.felevInformaciok);

                user.name = data.name;
                user.email = data.email;
                loadAuthentication();
                if (data.code == 1) {
                    mainView.router.loadPage('nyitolap.html');
                } else if (data.code == 2) {
                    myApp.alert(data.modal.text, data.modal.title);
                    mainView.router.loadPage('adategyeztetes.html');
                }
            }
        });
    });
});

myApp.onPageBeforeAnimation('loadingScreen', function (page) {
    back(true);
});

myApp.onPageBeforeAnimation('adategyeztetes', function (page) {
    currentPage = "adategyeztetes";
    $("input[name='neptun']").val(authenticate.neptun);
    $("input[name='name']").val(user.name);
    $("input[name='email']").val(user.email);
});
myApp.onPageInit('adategyeztetes', function (page) {
    $("#adategyeztetoForm").submit(function (event) {
        $('#adategyeztetoButton').attr('disabled', 'disabled');
        event.preventDefault();
        var data = $("#adategyeztetoForm").serialize();
        var $form = $(this),
            url = $form.attr('action');
        var posting = $.post(url + "&token=" + authenticate.auth_token, data);

        posting.done(function (data) {
            if (data.code == 0) {
                myApp.alert(data.message, "Sikertelen");
                logout();
                mainView.router.loadPage('login.html');
            } else {
                user.name = data.name;
                user.email = data.email;
                mainView.router.loadPage('nyitolap.html');
            }
        });
    });
});


function logout() {
    window.localStorage.removeItem("auth_token");
    window.localStorage.removeItem("neptun");
    window.localStorage.removeItem("szektor");
    window.localStorage.removeItem("utca");
    window.localStorage.removeItem("utcanev");
    window.localStorage.removeItem("felev");
    window.localStorage.removeItem("felevStatus");
    window.localStorage.removeItem("felevInformaciok");
    loadAuthentication();
}

function loadAuthentication() {
    authenticate.auth_token = window.localStorage.getItem("auth_token");
    authenticate.neptun = window.localStorage.getItem("neptun");
    authenticate.szektor = window.localStorage.getItem("szektor");
    authenticate.utca = window.localStorage.getItem("utca");
    authenticate.utcanev = window.localStorage.getItem("utcanev");
    authenticate.felev = window.localStorage.getItem("felev");
    authenticate.felevStatus = window.localStorage.getItem("felevStatus");
    authenticate.felevInformaciok = window.localStorage.getItem("felevInformaciok");
}

function initialization() {
    loadingTextLabel.html("Felhasználó adatainak betöltése");
    loadAuthentication();
    if (authenticate.auth_token != null && authenticate.neptun != null && authenticate.szektor != null && authenticate.utca != null && authenticate.felev != null) {
        var checking = $.post(apiaddress+"?action=CheckIn",
            {
                auth_token: authenticate.auth_token,
                neptun: authenticate.neptun,
                szektorutca: authenticate.szektor + "/" + authenticate.utca,
                felev: authenticate.felev
            }
        );
        checking.done(function (data) {
            if (data.code == 0) {
                logout();
                mainView.router.loadPage('login.html');
            } else {
                user.name = data.name;
                user.email = data.email;
                window.localStorage.setItem("felevStatus", data.felevStatus);
                window.localStorage.setItem("felevInformaciok", data.felevInformaciok);
                loadAuthentication();
                if (data.code == 1) {
                    mainView.router.loadPage('nyitolap.html');
                } else if (data.code == 2) {
                    myApp.alert(data.modal.text, data.modal.title);
                    mainView.router.loadPage('adategyeztetes.html');
                }
            }
        });
        checking.fail(function (xhr, textStatus, errorThrown) {
            myApp.alert(JSON.stringify(xhr));
        });
    } else {
        mainView.router.loadPage('login.html');
    }
}

function loaded() {
    loadingTextLabel.html("BackButton esemény regisztrálása");
    document.addEventListener("backbutton", onBackKeyDown, false);
    loadingTextLabel.html("Framework előkészítése");
    myApp = new Framework7();

    loadingTextLabel.html("Szoftver verzióadatok lekérdezése...");
    $.ajax(apiaddress+"?action=Version")
        .done(function (sversion) {
            server.version = sversion.version;
            server.maintenance = sversion.maintenance;
            if (sversion.maintenance) {
                myApp.alert("A szerveren jelenleg karbantartást végzünk, ezért az alkalmazás nem elérhető. Szíves türelmét kérjük.", "Karbantartás", function () {
                    back(true)
                });
                return;
            }

            if (sversion.version > client_version) {
                myApp.confirm("Új frissítés jelent meg, amit telepíteni kell az alkalmazás használatához.<br>Jelenlegi verzió: " + client_version + "<br>Elérhető verzió: " + sversion.version + "<br>Frissíted most az alkalmazást?", "Frissítés", function () {
                    cordova.plugins.market.open('hu.u_szeged.geo.varosifak');
                }, function () {
                    back(true)
                });
                return;
            }
            if (device.platform.toLowerCase() == "android") {
                loadingTextLabel.html("GPS hozzáférés megadásának ellenőrzése...");
                cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
                    var okay = false;
                    switch (status) {
                        case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                            initialization();
                            break;
                        case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                            initialization();
                            break;
                        case cordova.plugins.diagnostic.permissionStatus.DENIED:
                            myApp.alert("Jogosultság megadása el lett utasítva, az alkalmazás enélkül nem képes futni.", "GPS hozzáférés megtagadva", function () {
                                back(true);
                            });
                            break;
                        case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                            myApp.alert("Jogosultság megadása véglegesen el lett utasítva, az alkalmazás enélkül nem képes futni. Az alkalmazás törlése majd újratelepítése után újra felkínálja a jogosultság engedélyezését!", "GPS hozzáférés megtagadva", function () {
                                back(true);
                            });
                            break;
                    }
                }, function (error) {
                    myApp.alert(error);
                });
            } else {
                loadingTextLabel.html("Browser módban nem szükséges előzetes GPS jogosultság");
                initialization();
            }
        })
        .fail(function (xhr, textStatus, errorThrown) {
            alert(JSON.stringify(xhr));
            myApp.alert("A szerver nem érhető el. Ez lehetséges egy esetleges nem tervezett karbantartás miatt vagy az internetkapcsolat hiánya miatt.", "Nincs kapcsolat", function () {
                back(true);
            });
        });
}

// Export selectors engine
var $$ = Dom7;

// Generate dynamic page
var dynamicPageIndex = 0;
function createContentPage() {
    mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
    return;
}

function mask(masking) {
    var number = 0;
    while ((cmask = masking.pop()) !== undefined) {
        number += Math.pow(2, cmask);
    }
    return number;
}
function unmask(number) {
    var unmask = [];
    var bazis = number;
    var alap = Math.round(Math.log2(bazis));

    for (i = alap; alap >= 0 && bazis > 0; alap--) {
        if (bazis - Math.pow(2, alap) >= 0) {
            bazis -= Math.pow(2, alap);
            unmask.push(alap);
        }
    }
    return unmask;
}