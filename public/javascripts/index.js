function refreshTime(time) {
    var currentTime = "1970-01-01T" + new Date().toLocaleTimeString();
    $(".subheader").text("Zuletzt aktualisiert vor " + Math.floor((Date.now()-loadTime)/1000/60) + " min")
    var time1 = new Date(currentTime).getTime(); // current time as timestamp
    for (var i = 0; i < time.length; i++) {
        var departureTime = "1970-01-01T" + time[i];
        var time2 = new Date(departureTime).getTime(); // php time as timestamp
        var timediff = Math.ceil((time2 - time1) / 1000 / 60); // Difference in min, rounded
        if (timediff < 0) {
            document.getElementsByClassName('departure')[i].style.opacity = '0.2';
            timediff = 0;
        }
        document.getElementsByClassName('time')[i].innerHTML = 'in ' + timediff + ' min';
    }
}
var allTimes = []; // create Array
var loadTime = Date.now();

$(".subheader").onclick=refresh;

function refresh() {
    $(".box").each(function () {
        var id = $(".id", this).html();
        var box = this;
        getData(id, function (deps) {
            loadTime = Date.now();
            fillNew(deps, box);
        })
    })
}

function fillNew(deps, box){
    allTimes = [];
    var depDiv = $(".departure:first", box).clone().css("opacity", "1");
    var border = $(".borderline:first", box).clone();
    $(".departure", box).remove();
    $(".borderline", box).remove();
    for(i=0; i<deps.length; i++){
        $(box).append(depDiv.clone());
        $(box).append(border.clone());
        $(".depTime:last", box).text(deps[i].time);
        $(".line:last", box).text(deps[i].line);
        $(".dest:last", box).text(' ► '+deps[i].dest);
        if (deps[i].type === 'Bus') $("img:last", box).prop("src", "/images/bus.jpg");
        else if (deps[i].type === 'S-Bahn') $("img:last", box).prop("src", "/images/sbahn.png");
        else if (deps[i].type === 'RB') $("img:last", box).prop("src", "/images/bahn.gif");
        else if (deps[i].type === 'Tram') $("img:last", box).prop("src", "/images/tram.png");
        else $("img:last", box).prop("src", "/images/ubahn.png")
    }
    $(".departure:gt(3)", box).css("display", "none");
    $(".borderline:gt(3)", box).css("display", "none");
    $(".depTime").each(function () {
        allTimes.push($(this).text());
    });
    refreshTime(allTimes);
}

var left = 0;
var width = 0;

function maximize(node) {
    var box = node.parentNode.parentNode;

    var id = $(".id", box).html();
    if ($(box).hasClass("latest")){
        animate();
    }
    else{
        getData(id, function (result) {
            $(box).addClass("latest");
            fillNew(result, box);
            animate();
        });
    }

    function animate() {
        node.setAttribute('onclick', 'minimize(this)');

        $(node).fadeOut(200);
        left = box.offsetLeft + "px";
        width = box.offsetWidth + "px";
        box.style.left = left;
        box.style.position = "absolute";
        box.style.display = "block";
        $(".departure, .borderline", box).hide();
        $(".box").not(box).fadeOut(0, "easeInOutExpo", function () {
            $("*", box).addClass("max");
            $(box).addClass("max");
        });

        $(box).animate({
            "left": "0",
            width: "100%",
            height: "+=13px",
        }, 800, "easeInOutExpo");
        $(".boxheader", box).animate({
            width: "100%"
        }, 800, "easeInOutExpo");
        $(".boxheader-text", box).animate({
            left: "18px"
        }, 800, "easeInOutExpo", function () {
            $("i", node).text("close");
            $(node).fadeIn();
        });
        var d = 70, factor = d / 3 * 2; // increment delay by two thirds original delay
        $(".departure, .borderline", box).delay(500).each(function () {
            $(this).delay(d = d + factor).fadeIn(400);
        });
    }
}

function minimize(node) {
    $("*").stop( true, true );
    var box = node.parentNode.parentNode;

    node.setAttribute('onclick','maximize(this)');
    $(node).fadeOut(200);
    $(".departure, .borderline", box).hide();
    $("*", box).removeClass("max");
    $(box).removeClass("max");
    console.log(width);
    $(box).animate({
        width: width,
        height: "+=-13px",
        left: left
    }, 700, "easeInOutExpo", function () {
        $(".departure, .borderline", box).not(".departure:gt(3), .borderline:gt(2)", box).fadeIn();
        $("i", node).text("arrow_forward");
        $(node).fadeIn("easeInOutExpo");
        box.style.position = "relative";
        box.style.left = "0";
        $(".box").not(box).fadeIn(400);
    });
}

function getData(id, callback) {
    console.log("Fetching Data for "+id);
    $("#toast, #loading").stop(true, true);
    $("#loading").animate({
        left: "100%"
    }, 1000, "easeInOutExpo", function () {
        $("#loading").animate({
            right: "100%",
            left: "-150px"
        }, 1000, "easeInOutExpo");
    });
    $("#toast").fadeIn(700).delay(300).fadeOut(700).fadeIn(700).delay(300).fadeOut(700);
    $.ajax({
        url: "/"+id+"/13",
        success: function (result) {
            callback(result);
        }
    });
}

jQuery.extend(jQuery.easing,
    {
        easeInOutMaterial: function (x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c/2*t*t + b;
            return c/4*((t-=2)*t*t + 2) + b;
        }
    });
