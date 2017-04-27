var canvas, panorama, signs;

$( document ).ready(function() {
  var nQuestions = $('#questions > div').length;
	var latitude = $('#lat').val(), longitude = $('#lon').val();

	canvas = new fabric.Canvas('c');
	canvas.setWidth(800);
	canvas.setHeight(600);

	// Background
	changeScenery(latitude, longitude, 200, -5, 1);

	// Change coordinates
	$('#updateLocation').click(function (e) {

		latitude = parseFloat($('#latitude').val());
		longitude = parseFloat($('#longitude').val());

    changeSceneryPickerLocation(latitude, longitude);
	});

	$('#addQuest').click(function () {

		$('#questions').append(
			'<div class="form-group">' +
				'<label>Question ' + (nQuestions + 1 )+'</label> ' +
				'<input name="question[' + (nQuestions + 1) + ']" type="text" class="form-control">' +
			'</div>'
		)
		nQuestions++;

	})

	$('#saveScenery').click(function () {
		changeScenery(panorama.getPosition().lat(), panorama.getPosition().lng(), panorama.getPov().heading, panorama.getPov().pitch, panorama.getZoom());

		$('#lon').val(panorama.getPosition().lng());
		$('#lat').val(panorama.getPosition().lat());
		$('#heading').val(panorama.getPov().heading);
		$('#pitch').val(panorama.getPov().pitch);
		$('#zoom').val(panorama.getZoom());

		console.log($('#lon').val());
		console.log($('#lat').val());
		$('#sceneryPickerModal').modal('hide');
	});

	initialize();

  // Bind the event listeners for the image elements
  signs = document.querySelectorAll('#signs img');
  [].forEach.call(signs, function (img) {
    img.addEventListener('dragstart', handleDragStart, false);
    img.addEventListener('dragend', handleDragEnd, false);
  });
  // Bind the event listeners for the canvas
  var canvasContainer = document.getElementById('canvas-container');
  canvasContainer.addEventListener('dragenter', handleDragEnter, false);
  canvasContainer.addEventListener('dragover', handleDragOver, false);
  canvasContainer.addEventListener('dragleave', handleDragLeave, false);
  canvasContainer.addEventListener('drop', handleDrop, false);
});

window.changeSceneryPickerLocation = function (latitude, longitude) {
  var location = {lat: latitude, lng: longitude};
  panorama = new google.maps.StreetViewPanorama(
    document.getElementById('sceneryPickerCanvas'), {
      position: location,
      pov: {
        heading: 34,
        pitch: 10
      }
    });
};

window.changeScenery = function (latitude, longitude, heading, pitch, zoom) {
  var fov = 180 / Math.pow(2,zoom || 1);
	// Background
	fabric.Image.fromURL('https://maps.googleapis.com/maps/api/streetview?size=800x600&location=' +
		latitude +
		',' + longitude +
		'&fov=' + fov +
		'&heading=' + heading +
		'&pitch=' + pitch +
		'&key=AIzaSyB_DzzYoHNMdyJYe53zW5j81EqRwv7r3RY', function(image) {
		image.set({
			width:800,
			height:600,
		});

		canvas.setBackgroundImage(image);
		canvas.renderAll();
	});
}

window.addSign = function(fileName) {

	fabric.Image.fromURL('../images/signs/large/' + fileName, function(image) {
		image.scaleToWidth(50);
		canvas.add(image);
	});
}

window.deleteObject = function() {
	if(canvas.getActiveGroup()){
		canvas.getActiveGroup().forEachObject(function(o){
			canvas.remove(o)
		});
		canvas.discardActiveGroup().renderAll();
	} else {
		canvas.remove(canvas.getActiveObject());
	}
}

function initialize() {
  var fenway = {lat: 42.345573, lng: -71.098326};
  var map = new google.maps.Map(document.getElementById('c'), {
    center: fenway,
    zoom: 14
  });
  panorama = createDefaultPanorama();

  $("#sceneryPickerModal").on("shown.bs.modal", function () {
    google.maps.event.trigger(map, "resize");
    panorama = createDefaultPanorama();
  });
}

function createDefaultPanorama() {
  var panorama = new google.maps.StreetViewPanorama(
    document.getElementById('sceneryPickerCanvas'), {
      position: {lat: 42.345573, lng: -71.098326},
      pov: {
        heading: 34,
        pitch: 10
      }
    });
  return panorama;
}

// -----------------------------------
// Drag and Drop into fabric.js canvas
// -----------------------------------

function handleDragStart(e) {
  [].forEach.call(signs, function (img) {
    img.classList.remove('img_dragging');
  });
  this.classList.add('img_dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.
  // NOTE: comment above refers to the article (see top) -natchiketa

  return false;
}

function handleDragEnter(e) {
  // this / e.target is the current hover target.
  this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over'); // this / e.target is previous target element.
}

function handleDrop(e) {
  // this / e.target is current target element.

  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }

  var img = document.querySelector('#signs img.img_dragging');

  /*var newImage = new fabric.Image(img, {
    width: img.width,
    height: img.height,
    // Set the center of the new object based on the event coordinates relative
    // to the canvas container.
    left: e.layerX,
    top: e.layerY
  });*/
  var imageURL = '../images/signs/large/' + $('#signs img.img_dragging').attr('src').split('/').pop();
  fabric.Image.fromURL(imageURL, function(image) {
    image.scaleToHeight(100);
    image.setLeft(e.layerX);
    image.setTop(e.layerY);
    canvas.add(image);
    canvas.setActiveObject(image);
  });

  return false;
}

function handleDragEnd(e) {
  // this/e.target is the source node.
  [].forEach.call(signs, function (img) {
    img.classList.remove('img_dragging');
  });
}