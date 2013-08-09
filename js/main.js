      var last = 0;
      var points;
      var map;
      var panorama;
      var carryOn = true;
      var jump = 10;
      var widget = $(".selector").slider("widget");

      function bearingTo(from, to) {
        var deltaY = to.lat() - from.lat();
        var deltaX = to.lng() - from.lng();
        return Math.atan2(deltaX, deltaY) * 180 / Math.PI;
      }

      function toGooglePoint(point) {
        return new google.maps.LatLng(parseFloat(point.attributes["lat"].value, 10), parseFloat(point.attributes["lon"].value, 10));
      }


      function drawImage() {
        if (last + jump < points.length) {
          last += jump;
          panorama.setVisible(false);
          map.setCenter(toGooglePoint(points[last]));
          panorama.setPov({
            heading: bearingTo(toGooglePoint(points[last]), toGooglePoint(points[last + jump])),
            pitch: 0
          });
          panorama.setPosition(toGooglePoint(points[last]));
          panorama.setVisible(true);
          if (carryOn) setTimeout(drawImage, 750);
        };
      }

      function loadMap() {
        var mapOptions = {
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map($('#map-canvas')[0],
          mapOptions);
        var panOptions = {
          addressControl: false,
          clickToGo: false,
          linksControl: false,
          panControl: false,
          scrollWheel: false,
          zoomControl: false
        };
        panorama = new google.maps.StreetViewPanorama($('#pano')[0], panOptions);
      }

      function initialize(input) {

        last = 0;
        points = [];
        carryOn = true;
        $('#GPXViewer').modal('show');
        $('#GPXViewer').on('shown.bs.modal', function() {
          google.maps.event.trigger(map, 'resize');
        })      

        if (input.files && input.files[0]) {
          var reader = new FileReader();
          reader.onloadend = function(e) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(e.target.result, "application/xml");;
            points = xmlDoc.getElementsByTagName("trkpt");
            var route = [];
            for (var i = 0; i < points.length; i++) {
              route.push(toGooglePoint(points[i]));
            };
            var path = new google.maps.Polyline({
              path: route,
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2
            });
            map.setCenter(route[0]);
            path.setMap(map);
            setTimeout(drawImage(),500);
          };
          reader.readAsText(input.files[0]);
        }
      }

      function stop() {
        carryOn = false;
      }

      function start() {
        carryOn = true;
        drawImage();
      }

      function restart() {
        carryOn = true;
        last = 0;
        drawImage();
      }

      function valuechanged(input) {
        jump = parseInt(input.value);
      }

      google.maps.event.addDomListener(window, 'load', loadMap);