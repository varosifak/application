var fak = new Array();
var watchID, fa, map, marker, circle, pontos = false;
var farogzitVerem = [1];
function nextPage(nextPageID) {
    nextPageID = typeof nextPageID !== 'undefined' ? nextPageID : null;
    var currentPage = farogzitVerem[farogzitVerem.length - 1];
    if (!nextPageID) {
        switch (fa.tipus) {
            case '2':
                switch (currentPage) {
                    case 3:
                        nextPage(10);
                        return;
                    case 10:
                        nextPage(17);
                        return;
                }
                break;
            case '3':
                switch (currentPage) {
                    case 3:
                        nextPage(13);
                        return;
                    case 13:
                        nextPage(17);
                        return;
                }
                break;
            case '4':
                switch (currentPage) {
                    case 3:
                        nextPage(10);
                        return;
                    case 10:
                        nextPage(13);
                        return;
                }
                break;
            case '5':
                switch (currentPage) {
                    case 3:
                        nextPage(17);
                        return;
                }
        }
    }

    $("#step_" + currentPage).hide(function () {
        if (nextPageID) {
            farogzitVerem.push(nextPageID);
            $("#step_" + nextPageID).show();
            eval("step" + nextPageID + "();");
        } else {
            farogzitVerem.push(currentPage + 1);
            $("#step_" + farogzitVerem[farogzitVerem.length - 1]).show();
            eval("step" + farogzitVerem[farogzitVerem.length - 1] + "();");
        }

    });
}
function onSuccess(position) {
    if (Math.round(position.coords.accuracy * 100) / 100 <= 6 && Math.round(position.coords.accuracy * 100) / 100 < Math.round(fa.acc * 100) / 100) {
        fa.timestamp = position.timestamp;
    } else {
        if (fa.timestamp && (fa.timestamp + 10000 < position.timestamp)) {
            navigator.geolocation.clearWatch(watchID);
            nextPage();
        }
    }

    if (Math.round(position.coords.accuracy * 100) / 100 <= Math.round(fa.acc * 100) / 100) {
        if (Math.round(position.coords.accuracy * 100) / 100 <= 6) {
            pontos = true;
            $("#GPSPontositStop").attr('class', 'button button-big button-fill color-green');
            $("#GPSPontositStop").html("Már majdnem kész...Várj!");
            $("#GPSPontositStop").prop('disabled', true);
        }
        fa.lat = position.coords.latitude;
        fa.lng = position.coords.longitude;
        fa.acc = position.coords.accuracy;

        $("input[name='koordinatak']").val(fa.lat + ", " + fa.lng);
        $("input[name='pontossag']").val((Math.round(fa.acc * 100) / 100) + " méter (Ajánlott: min. 6 méter)");

        var pos = {lat: fa.lat, lng: fa.lng};

        map.panTo(pos);
        //map.setCenter(pos);
        map.setZoom(fa.acc > 1000 ? 10 : (fa.acc > 500 ? 12 : fa.acc > 100 ? 13 : fa.acc > 20 ? 15 : 17));

        marker.setPosition(pos);
        circle.setMap(null);
        circle = new google.maps.Circle({
            center: pos,
            radius: fa.acc,
            map: map,
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            strokeColor: '#FF0000',
            strokeOpacity: 0.7
        });

    }
}
function onError(error) {
    console.log('code: ' + error.code + '\n' + error.message + '\n', "");
}
function gpsSpecify() {
    watchID = navigator.geolocation.watchPosition(onSuccess, onError,
        {
            timeout: 3000,
            enableHighAccuracy: true
        });
}
/**
 * Fa típusa + faj meghatározása
 */
function step1() {
    function nextButtonCheck() {
        $("#step_1 .next").off().on("click", function () {
            if(fa.fa_fajta==0){
                $("#readyAndPiszkozat").show();
                $("#readyAndSend").hide();
            }else{
                $("#readyAndPiszkozat").hide();
                $("#readyAndSend").show();
            }
            if (fa.fa_fajta || fa.tipus != 1) {
                nextPage();
            }
        });
        if (fa.tipus == 1) {
            $("#faNev").show();
            if (fa.fa_fajta) {
                $("#treeInformation").show();
                $("#step_1 .nextButton").show();
            } else {
                $("#treeInformation").hide();
                $("#step_1 .nextButton").hide();
            }
        } else {
            $("#faNev").hide();
            $("#treeInformation").hide();
            $("#step_1 .nextButton").show();
        }
    }

    $('input[type=radio][name=tipus]').off().on("change", function () {
        fa.tipus = $(this).val();
        nextButtonCheck();
    });
    $('#kepekAFarol').off().on('click', function () {
        myApp.photoBrowser({
            photos: fak[fa.fa_fajta].kepek,
            theme: 'dark',
            captionsTheme: 'dark',
            material: true,
            type: 'popup',
            backLinkText: 'Bezár',
            ofText: '/'
        }).open();
    });
    $("#neve").off().on("change", function () {
        var value = $("#neve").val();
        fa.fa_fajta = value;
        if (fak[value].kepek && fak[value].kepek.length > 0) {
            $("#kepekAFarol").html("Képek erről: " + fak[value].magyar);
            $("#faKepek").show();
        } else {
            $("#faKepek").hide();
        }

        $("#faLeiras").html(fak[value].megjegyzes != null && fak[value].megjegyzes.length > 0 ? fak[value].megjegyzes : "Nincsenek");
        $("#treeInformation").show();
        nextButtonCheck();
    });
}
/**
 * Geolokációs adatok meghatározása
 */
function step2() {
    $("input[name='hazszam']").focus();
    $("input[name='hazszam']").on("change", function () {
        var hazszamLength = $("input[name='hazszam']").val().length;
        fa.hazszam = $("input[name='hazszam']").val();
        if (hazszamLength == 0) {
            $("#positionalas").hide();
        } else {
            $("#positionalas").show();
        }
    });

    if (!fa.lat) {
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 8,
            center: {lat: 46.2500813, lng: 20.1449711}
        });
        marker = new google.maps.Marker({
            position: {lat: 46.2500813, lng: 20.1449711},
            map: map
        });
        circle = new google.maps.Circle({
            center: {lat: 46.2500813, lng: 20.1449711},
            radius: 5000,
            map: map,
            fillColor: '#FF0000',
            fillOpacity: 0.2,
            strokeColor: '#FF0000',
            strokeOpacity: 0.7
        });
        map.fitBounds(circle.getBounds());
    }

    $("#GPSPontositStart").off('click').on("click", function () {
        $("#GPSPontositNext").hide();
        myApp.alert("Állj a bemérendő fá torzséhez, majd nyomd meg az Ok gombot!", "Figyelem!", function () {
            $("#GPSPontositStart").hide(function () {
                $("#GPSPontositStop").show();
                $("#GPSPontositStop").off('click').on("click", function () {
                    if (!pontos) {
                        myApp.confirm("A pozíció bemérésének pontossága még az ajánlott értéken kívül esik. Biztos, hogy elmented a jelenlegi pontossággal a fát?\nKésőbb is emlékezned kell rá, hogy hol van pontosan!", "Még nem teljesen pontos...", function () {
                            navigator.geolocation.clearWatch(watchID);
                            nextPage();
                        }, function () {
                        });
                    }
                });
            });
            gpsSpecify();
        });
    });
}
/**
 * Fényképek a fáról
 */
function step3() {
    function toDataUrl(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();
    }

    function step3_kepek() {
        if (fa.image1) {
            $("#picture1").html("<IMG id='myImage1' height='100%' width='100%'>");
            var image1 = document.getElementById('myImage1');
            image1.src = fa.image1;
            toDataUrl(fa.image1, function (data) {
                fa.image1b64 = data;
            });
        } else {
            $("#picture1").html('<span class="glyphicon glyphicon-camera camicon"></span>');
            fa.image1b64 = null;
        }
        if (fa.image2) {
            $("#picture2").html("<IMG id='myImage2' height='100%' width='100%'>");
            var image2 = document.getElementById('myImage2');
            image2.src = fa.image2;
            toDataUrl(fa.image2, function (data) {
                fa.image2b64 = data;
            });
        } else {
            $("#picture2").html('<span class="glyphicon glyphicon-camera camicon"></span>');
            fa.image2b64 = null;
        }
        if (image1 || device.platform.toLowerCase() != "android") {
            $("#nextSlideButton_3").show();
        } else {
            $("#nextSlideButton_3").hide();
        }
    }

    step3_kepek();
    $("#GPSPontositStop").attr('class', 'button button-big button-fill color-red');
    $("#GPSPontositStop").html("Pozícionálás megszakítása");
    $("#GPSPontositStop").prop('disabled', false);
    $("#GPSPontositStop").hide();
    $("#GPSPontositStart").show();
    $("#GPSPontositStart").html("Újrapozícionálás");
    $("#GPSPontositNext").show();
    $("#GPSPontositNext").off('click').on("click", function () {
        nextPage();
    });

    $("#nextSlideButton_3").off('click').on("click", function () {
        nextPage();
    });
    var cameraOptions = {
        quality: 40,
        allowEdit: false,
        targetWidth: 1080,
        targetHeight: 1920,
        cameraDirection: 0,
        mediaType: 0,
        correctOrientation: true,
        destinationType: Camera.DestinationType.FILE_URI
    };
    $("#picture1").off('click').on("click", function () {
        if (fa.image1) {
            myApp.confirm("Itt már van egy elkészült kép. Biztos szeretnéd törölni?", "Törlöd?", function () {
                fa.image1 = null;
                step3_kepek();
            }, function () {
            });
        } else {
            navigator.camera.getPicture(function (imageURI) {
                fa.image1 = imageURI;
                step3_kepek();
            }, function () {
            }, cameraOptions);
        }
    });

    $("#picture2").off('click').on("click", function () {
        if (fa.image2) {
            myApp.confirm("Itt már van egy elkészült kép. Biztos szeretnéd törölni?", "Törlöd?", function () {
                fa.image2 = null;
                step3_kepek();
            }, function () {
            });
        } else {
            navigator.camera.getPicture(function (imageURI) {
                fa.image2 = imageURI;
                step3_kepek();
            }, function () {
            }, cameraOptions);
        }
    });
}
/**
 * Korona állapota (nincs, súlyosan sérült, menthető, sérült, enyhén sérült, ép)
 */
function step4() {
    function nextButtonCheck() {
        $("#step_4 .next").off().on("click", function () {
            nextPage();
        });
        $("#step_4 .nextButton").show();
    }

    $('input[type=radio][name=korona_allapota]').off().on("change", function () {
        fa.koronaAllapota = $(this).val();
        if(fa.koronaAllapota == 0){
            nextPage(8);
            return;
        }
        nextButtonCheck();
        nextPage();
    });
}
/**
 * Korona forma (Ellipszoid, gömb, kúp...)
 */
function step5() {
    $('input[type=radio][name=koronaforma]').off().on("change", function () {
        fa.koronaForma = $('input[name=koronaforma]:checked').val();
        if (fa.koronaForma == 11) {
            $("#koronaFormaEgyebDIV").show(function () {
                $("input[name='koronaforma_egyeb']").focus();
            });
            $("input[name='koronaforma_egyeb']").off().on("change", function () {
                fa.koronaFormaEgyeb = $("input[name='koronaforma_egyeb']").val();
                if (fa.koronaFormaEgyeb.length > 0) {
                    $("#nextSlideButton_5").show();
                } else {
                    $("#nextSlideButton_5").hide();
                }
            });
        } else {
            $("#koronaFormaEgyebDIV").hide();
            nextPage();
        }
    });
    $("#nextSlideButton_5").off().on("click", function () {
        nextPage();
    });
}
/**
 * Koronával kapcsolatos adatok (átmérő, hiány, fény)
 */
function step6() {
    $('input[name=koronasugar]').focus();
    $('input[name=koronasugar]').off().on("change", function () {
        fa.koronaSugar = $('input[name=koronasugar]').val();
        if (fa.koronaSugar.length > 0) {
            $("#miazazatmero").hide();
            $("#nextSlideButton_6").show();
        } else {
            $("#miazazatmero").show();
            $("#nextSlideButton_6").hide();
        }
    });
    $('input[name=koronaHiany]').on("change", function () {
        fa.koronaHiany = $('input[name=koronaHiany]').val();
        $("#hianyAKoronaban").html(fa.koronaHiany);
    });

    $('input[name=koronaElhalt]').on("change", function () {
        fa.koronaElhalt = $('input[name=koronaElhalt]').val();
        $("#elhaltAKoronaban").html(fa.koronaElhalt);
    });

    $('input[name=koronaFeny]').on("change", function () {
        fa.koronaFeny = $('input[name=koronaFeny]').val();
        $("#fenyAKoronaban").html(fa.koronaFeny);
    });

    $("#nextSlideButton_6").off().on("click", function () {
        nextPage();
    });
}
/**
 * Koronában található (száraz ág, száraz vázág ...)
 */
function step7() {
    $("#nextSlideButton_7").on("click", function () {
        var toMasking = [];
        $('input[name=koronaban]:checked').each(function () {
            var value = $(this).attr("value");
            toMasking.push(value);
        });
        fa.koronaban = mask(toMasking);
        nextPage();
    });
}
/**
 * Koronáalapban található (korhadás, odú, sérülés..)
 */
function step8() {
    $("#nextSlideButton_8").on("click", function () {
        var toMasking = [];
        $('input[name=koronaalapnal]:checked').each(function () {
            var value = $(this).attr("value");
            toMasking.push(value);
        });
        fa.koronaAlapnal = mask(toMasking);
        nextPage();
    });
}
/**
 * Törzs állapota (nincs, súlyosan sérült, menthető, sérült, enyhén sérült, ép)
 */
function step9() {
    $('input[type=radio][name=torzs_allapota]').off().on("change", function () {
        fa.torzsAllapota = $(this).val();
        nextPage();
    });
}
/**
 * Törzsek száma, méretei, magassága, kerülete alul
 */
function step10() {
    function shadow_showNextbutton() {
        var kitoltottek = (fa.torzs1Kerulet && fa.torzs1Kerulet.length > 0 ? 1 : 0) + (fa.torzs2Kerulet && fa.torzs2Kerulet.length > 0 ? 1 : 0) + (fa.torzs3Kerulet && fa.torzs3Kerulet.length > 0 ? 1 : 0);
        if (fa.torzsSzama && fa.torzsSzama > 0 && kitoltottek >= fa.torzsSzama && fa.torzsAlul && fa.torzsAlul.length > 0 && fa.torzsMagassag && fa.torzsMagassag.length > 0) {
            $("#nextSlideButton_9").show();
        } else {
            $("#nextSlideButton_9").hide();
        }
    }

    $('input[type=radio][name=torzsSzama]').off().on("change", function () {
        fa.torzsSzama = $('input[name=torzsSzama]:checked').val();
        shadow_showNextbutton();
        if (fa.torzsSzama == 1) {
            $("#torzsAtmero1").show();
            $("#torzsAtmero2").hide();
            $("#torzsAtmero3").hide();
        }
        if (fa.torzsSzama == 2) {
            $("#torzsAtmero1").show();
            $("#torzsAtmero2").show();
            $("#torzsAtmero3").hide();
        }
        if (fa.torzsSzama == 3) {
            $("#torzsAtmero1").show();
            $("#torzsAtmero2").show();
            $("#torzsAtmero3").show();
        }
    });
    $("input[name='torzsAlul']").off().on("change", function () {
        fa.torzsAlul = $("input[name='torzsAlul']").val();
        shadow_showNextbutton();
    });
    $("input[name='torzsMagassag']").off().on("change", function () {
        fa.torzsMagassag = $("input[name='torzsMagassag']").val();
        shadow_showNextbutton();
    });
    $("input[name='torzs1Kerulet']").off().on("change", function () {
        fa.torzs1Kerulet = $("input[name='torzs1Kerulet']").val();
        shadow_showNextbutton();
    });
    $("input[name='torzs2Kerulet']").off().on("change", function () {
        fa.torzs2Kerulet = $("input[name='torzs2Kerulet']").val();
        shadow_showNextbutton();
    });
    $("input[name='torzs3Kerulet']").off().on("change", function () {
        fa.torzs3Kerulet = $("input[name='torzs3Kerulet']").val();
        shadow_showNextbutton();
    });
    $("#nextSlideButton_9").off().on("click", function () {
        if(fa.torzsAllapota == 0){
            nextPage(12);
            return;
        }
        nextPage();
    });
}
/**
 * Törzsön (korhadás, odú, sérülés, sarj), Gyökérnyakon (Korhadás, Odú, Sérülés, Sarj)
 */
function step11() {
    $("#nextSlideButton_11").on("click", function () {
        var toMasking = [];
        $('input[name=torzson]:checked').each(function () {
            var value = $(this).attr("value");
            toMasking.push(value);
        });
        fa.torzson = mask(toMasking);

        var toMasking2 = [];
        $('input[name=gyokernyakon]:checked').each(function () {
            var value = $(this).attr("value");
            toMasking2.push(value);
        });
        fa.gyokernyakon = mask(toMasking2);

        nextPage();
    });
}
/**
 * Fára jellemzőek (Ifjított, tőtőál ágas, alánőtt, külpontos, dőlt törzs, borostyán, fagyöngy, ránőtt
 */
function step12() {
    $("#nextSlideButton_12").on("click", function () {
        var toMasking = [];
        $('input[name=egyeb]:checked').each(function () {
            var value = $(this).attr("value");
            toMasking.push(value);
        });
        fa.egyeb = mask(toMasking);
        nextPage();
    });
}
/**
 * Fa helyének anyaga, fa helyének mérete, veszélyeztetett épületek
 */
function step13() {
    function villamkerdes1() {
        if (fa.tipus == 3) {
            nextPage();
            return;
        }
        myApp.modal({
            title: 'Kérdés',
            text: 'Van a fa által veszélyeztetett épület közelben?',
            verticalButtons: true,
            buttons: [
                {
                    text: 'Van',
                    onClick: function () {
                        fa.kozeliEpulet = true;
                        nextPage();
                    }
                },
                {
                    text: 'Nincs',
                    onClick: function () {
                        fa.kozeliEpulet = false;
                        nextPage();
                    }
                }
            ]
        });
    }

    $("#nextSlideButton_13").off().on("click", function () {
        villamkerdes1();
    });
    function checkIsStep14() {
        if (fa.faHelyJellemzo == 6) {
            if (fa.faHelyJellemzoEgyeb.length > 0 && (fa.faHelyMeret && fa.faHelyMeret.length > 0)) {
                $("#nextSlideButton_13").show();
            } else {
                $("#nextSlideButton_13").hide();
            }
        } else if (fa.faHelyJellemzo == 3) {
            if (fa.faHelyJellemzoFaveremracsAtmero.length > 0 && (fa.faHelyMeret && fa.faHelyMeret.length > 0)) {
                $("#nextSlideButton_13").show();
            } else {
                $("#nextSlideButton_13").hide();
            }
        } else {
            if (fa.faHelyMeret && fa.faHelyMeret.length > 0) {
                $("#nextSlideButton_13").show();
            } else {
                $("#nextSlideButton_13").hide();
            }
        }
    }

    $("input[name=faHelyJellemzoEgyeb], input[name=faHelyMeret], input[name=faHelyJellemzoFaveremracsAtmero]").off().on("change", function () {
        fa.faHelyJellemzoEgyeb = $("input[name=faHelyJellemzoEgyeb]").val();
        fa.faHelyMeret = $("input[name=faHelyMeret]").val();
        fa.faHelyJellemzoFaveremracsAtmero = $("input[name=faHelyJellemzoFaveremracsAtmero").val();
        checkIsStep14();
    });
    $('input[type=radio][name=faHelyJellemzo]').off().on("change", function () {
        fa.faHelyJellemzo = $('input[name=faHelyJellemzo]:checked').val();
        if (fa.faHelyJellemzo == 6) {
            $("#faHelyJellemzoEgyebDiv").show();
        } else {
            $("#faHelyJellemzoEgyebDiv").hide();
        }
        if (fa.faHelyJellemzo == 3) {
            $("#faHelyJellemzoFaveremracsDiv").show();
        } else {
            $("#faHelyJellemzoFaveremracsDiv").hide();
        }
        checkIsStep14();
    });
}
/**
 * Favédelem (Nincs, Támrúd, Rács, Keret, Kerítés stb)
 */
function step14() {
    $('input[type=radio][name=favedelem]').off().on("change", function () {
        fa.favedelem = $('input[name=favedelem]:checked').val();
        if (fa.favedelem == 1) {
            myApp.modal({
                title: 'Mennyi?',
                text: 'Hány támrúd védi a fát?',
                verticalButtons: true,
                buttons: [
                    {
                        text: '1',
                        onClick: function () {
                            fa.favedelem = 1;
                            nextPage();
                        }
                    },
                    {
                        text: '2',
                        onClick: function () {
                            fa.favedelem = 8;
                            nextPage();
                        }
                    },
                    {
                        text: '3 vagy több',
                        onClick: function () {
                            fa.favedelem = 9;
                            nextPage();
                        }
                    }
                ]
            });
        } else if (fa.favedelem == 12) {
            myApp.prompt('Milyen egyéb védelemmel rendelkezik a fa?', "Kérdés",
                function (value) {
                    fa.favedelemEgyeb = value;
                    nextPage();
                },
                function (value) {
                    $(this).prop('checked', false);
                    myApp.alert("Az Egyéb opció bejelölése visszavonva!", "Figyelem");
                }
            );
        } else {
            nextPage();
        }
    });
}
/**
 * Közművek (Elektromos közvilágítás, szabad légvezeték, gaz, távközlés, Kresz stb)
 */
function step15() {
    $("#nextSlideButton_15").on("click", function () {
        var toMasking = [];
        $('input[name=kozmuvek]:checked').each(function () {
            var value = $(this).attr("value");
            toMasking.push(value);
        });
        fa.kozmuvek = mask(toMasking);
        nextPage();
    });
}
/**
 * Fa magassága, fa állapota (Elhanyagolt, Súlyos ápolási hiányosságok, ápolt)
 */
function step16() {
    function faallapotadivopen() {
        if (fa.magassag && fa.magassag.length > 0 && fa.holtmagassag && fa.holtmagassag.length > 0) {
            if (fa.tipus == 4) {
                $("#nextB16").show();
                return;
            }
            $("#faallapotaDiv").show();
        } else {
            if (fa.tipus == 4) {
                $("#nextB16").hide();
                return;
            }
            $("#faallapotaDiv").hide();
        }
    }

    function checkValidity() {
        if (fa.holtmagassag.length > 0 && fa.magassag > fa.holtmagassag) {
            myApp.alert("A fa holt magassága nem lehet alacsonyabb a fa élő magasságánál!", "Figyelem!");
            $("#faallapotaDiv").hide();
        }
    }

    $("input[name='magassag']").focus();
    $("input[name='magassag']").off().on("change", function () {
        fa.magassag = $("input[name='magassag']").val();
        faallapotadivopen();
        checkValidity();
    });
    $("input[name='holtmagassag']").off().on("change", function () {
        fa.holtmagassag = $("input[name='holtmagassag']").val();
        faallapotadivopen();
        checkValidity();
    });
    $('input[type=radio][name=fa_allapota]').off().on("change", function () {
        fa.faAllapota = $('input[name=fa_allapota]:checked').val();
        nextPage();
    });
}
/**
 * Javasolt munkák, piszkozat, beküldés
 */
function step17() {
    if (fa.tipus == 2 || fa.tipus == 3 || fa.tipus == 5) {
        $("#javasoltDiv").hide();
    } else {
        $("#javasoltDiv").show();
    }
    $(".javmunka").on("click", function () {
        var toMasking = [];
        $('input[name=kozmuvek]:checked').each(function () {
            var value = $(this).attr("value");
            toMasking.push(value);
        });
        fa.ajanlott = mask(toMasking);
    });

    $("#readyAndSend, #readyAndPiszkozat").on("click", function () {
        myApp.showPreloader('Fa adatlap+képek feltöltése... Kérlek várj!');
        var urlExpansion="";
        if(fa.fa_fajta == 0){
            urlExpansion = "=piszkozat";
        }
        $.ajax({
            type: "POST",
            url: apiaddress+"?action=Rogzites&bekuld"+urlExpansion,
            data: JSON.stringify(fa),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data1) 
			{
                //data1.status, data1.sorszam
                myApp.hidePreloader();
                if (data1.status == 1) {
                    myApp.hidePreloader();
                    myApp.alert("A fa adatlapja sikeresen elkészült. A fa azonosítója " + data1.sorszam + " lett!", "Sikeres feltöltés!", function () {
                        $("#readyFullDone").hide();
                    });
                } else if (data1.status == 2) {
                    myApp.alert(data1.message, "Sikertelen művelet");
                } else {
                    myApp.alert(data1.message, "Authentikációs hiba!", function () {
                        logout();
                    });
                }
            },
            error: function (msg) {
                myApp.alert('Hiba történt, a feltöltés nem sikerült, kérlek próbáld újra!', 'Váratlan hiba');
                myApp.hidePreloader();
            },
            always: function () {
            }
        });
    });
}
function initFaFelvitel() {
    currentPage = "farogzites";
    $("#map-canvas").height($("body").height() / 100 * 50);
    $("#map-canvas").html("");

    fak = new Array();
    farogzitVerem = [1];

    watchID = null;
    map = null;
    marker = null;
    circle = null;
    pontos = false;
    fa = {
        auth_token: authenticate.auth_token,
        neptun: authenticate.neptun,
        szektor: authenticate.szektor,
        utca: authenticate.utca,
        felev: authenticate.felev,
        utcanev: authenticate.utcanev,
        tipus: 1,
        fa_fajta: null,
        lat: null,
        lng: null,
        acc: 9999999999,
        timestamp: null,
        image1: null,
        image2: null,
        image1b64: null,
        image2b64: null,
        magassag: null,
        holtmagassag: null,
        koronaAllapota: null,
        koronaForma: null,
        koronaFormaEgyeb: null,
        koronaSugar: null,
        koronaban: null,
        koronaAlapnal: null,
        koronaHiany: null,
        koronaElhalt: null,
        koronaFeny: null,
        torzsAllapota: null,
        torzsSzama: null,
        torzsAlul: null,
        torzs1Kerulet: null,
        torzs2Kerulet: null,
        torzs3Kerulet: null,
        torzsMagassag: null,
        torzson: null,
        gyokernyakon: null,
        egyeb: null,
        faHelyJellemzo: null,
        faHelyJellemzoEgyeb: null,
        faHelyMeret: null,
        faHelyJellemzoFaveremracsAtmero: null,
        kozeliEpulet: null,
        favedelem: null,
        favedelemEgyeb: null,
        kozmuvek: null,
        faAllapota: null,
        ajanlott: null,
        hazszam: null
    };

    $("input[name='utcanev']").val(fa.utcanev);
}
myApp.onPageBeforeInit('farogzites', function (page) {
    initFaFelvitel();
});
myApp.onPageBeforeAnimation('farogzites', function (page) {
    myApp.showPreloader('Fák listájának letöltése...');
    $.getJSON(apiaddress+"?action=Faklista", function (data) {
        myApp.hidePreloader();
        var items = [];
        items.push("<option selected disabled>Kérlek válassz</option>");
        items.push("<option value='0'>Nem tudom eldönteni</option>");
        fak[0] = {
            megjegyzes: "A faj meghatározásához segítséget kérsz. Minden más adatot tölts ki, illetve küldj be a fáról képeket is!\nA segítők a kitöltött fa-adatlap alapján meghatározzák majd a fa pontos faját és véglegesíteni fogják a felvitelt!\nNagyon fontos, hogy csak azzal foglalkoznak a segítők, amiknél már csak a faj meghatározása hiányzik!",
            kepek: null
        };
        $.each(data, function (key, val) {
            items.push("<optgroup label='" + val.kategoria + "'>");
            $.each(val.fajok, function (key_faj, val_faj) {
                fak[val_faj.id] = val_faj;
                items.push("<option value='" + val_faj.id + "'>" + val_faj.magyar + " / " + val_faj.latin + "</option>");
            });
            items.push("</optgroup>");
        });
        $("#neve").html(items.join(""));
    });
    step1();
});