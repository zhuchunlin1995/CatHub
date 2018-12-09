$(document).ready(function() {
    const canvas = document.getElementById("myCanvas");
    const memeCanvas = document.getElementById("memeCanvas");
    const ctx = canvas.getContext('2d');
    const loadImage = document.getElementById("uploadImageButton");
    const combineImage = document.getElementById("combineButton");
    const refresh = document.getElementById("refreshButton");
    const oneMore = document.getElementById("one-more-button");
    const submitMeme = document.getElementById("submitMeme");
    const combineButton = document.getElementById("combineThem");
    let sup1 = new SuperGif({ gif: document.getElementById('dataStore') } );
    var timeouts = [];
    var delay = parseInt($("#delay").val());
    var shouldEnd = false;
    let currentImage = new Image();
    currentImage.src = "./assets/logo.jpg";

    memeCanvas.width = document.getElementById('dataStore').width;
    memeCanvas.height = document.getElementById('dataStore').height;
    // For giphy api
    // Change the buttonname, inputquery, imagediv, loadingquery to use
    var apikey = 'dc6zaTOxFJmzC';
    var list = []
    var cur = -1
    var imagediv = $("#IMAGEDIV")

    // On click of combine button
    combineButton.onclick = function () {
        sup1.load(function(){
            delay = parseInt($("#delay").val())
            setTimeout(function() {
                showPreview();
            }, delay)
        })
    }

    // On click of upload image
    loadImage.onclick = function () {
        //TODO: OPEN FILE SYSTEM AND CHANGE CURRENTIMAGE TO THE UPLOADED IMAGE
        currentImage.src = "./assets/logo.jpg"
        memeCanvas.getContext('2d').clearRect(0, 0, memeCanvas.width, memeCanvas.height);
        memeCanvas.getContext('2d').drawImage(currentImage, 0, 0);
        currentImage.src = memeCanvas.toDataURL();
    }

    // On click of submitting meme
    submitMeme.onclick = function () {
        let memeInput = $("#memeInput").val();
        if (memeInput == null || memeInput == ""){
            alert("Please input a meme text");
        }
        memeCanvas.getContext('2d').clearRect(0, 0, memeCanvas.width, memeCanvas.height);
        memeCanvas.getContext('2d').font = '48px serif';
        memeCanvas.getContext('2d').fillText(memeInput, 10, 50);
        currentImage.src = memeCanvas.toDataURL();
    }

    // On clicking one more
    oneMore.onclick = function (){
        if (canvas.width == 0 || canvas.height == 0){
            document.getElementById('dataStore').src = "./assets/logo.jpg";
            sup1 = new SuperGif({ gif: document.getElementById('dataStore') } );
        } else {
            sup1.load_url("./assets/logo.jpg",
            function(){
                delay = parseInt($("#delay").val())
                setTimeout(function() {
                    showPreview();
                }, delay)
            });
        }
    }

    // On click of refresh, try to stop all timeout events, then start a new loop
    refresh.onclick = function () {
        if (canvas.width == 0 || canvas.height == 0){
            alert("Nothing to refresh!")
        } else {
            sup1.load(function(){
                shouldEnd = true;
                delay = parseInt($("#delay").val())
                setTimeout(function() {
                    shouldEnd = false;
                    showPreview();
                }, delay)
            });
        }
    }

    // Click to download
    combineImage.onclick = function () {
        if (canvas.width == 0 || canvas.height == 0){
            alert("Please first upload a image")
        } else {
            download();
        }
    }

    // Shows the combined canvas without download
    function showPreview() {
        // Set the size of the display canvas to that of original GIF
        canvas.width = sup1.get_canvas().width;
        canvas.height = sup1.get_canvas().height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let grabLimit = sup1.get_length();

        // Clear all timeOuts
        for (var i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        // Quick reset of the timer array
        timeouts = [];
        // Begin Animation Loop
        animate(0, grabLimit);
    }

    // To download image
    function download() {
        // Number of screenshots to take == number of frames in the original GIF
        // Milliseconds. 500 = half a second, should gives animation function 50 extra milliseconds to load (for Chrome)
        // e.g. the setTimeout of enterLoop is 200, then this grabRate should be 300
        var grabRate  = delay;
        var count     = 0;
        let grabLimit = sup1.get_length();

        // Start GIFEncoder to Capture Individual PNGs
        var encoder = new GIFEncoder();
        //0  -> loop forever, 1+ -> loop n times then stop
        encoder.setRepeat(0);
        //go to next frame every n milliseconds
        encoder.setDelay(grabRate);
        encoder.start();

        function showResults() {
            console.log('Finishing');
            encoder.finish();
            var binary_gif = encoder.stream().getData();
            var data_url = 'data:image/gif;base64,'+encode64(binary_gif);
            var p = document.createElement('p'); // is a node
            p.innerHTML = '<img src="' + data_url + '"/>\n';
            document.getElementsByTagName('body')[0].appendChild(p);
        }

        // Implementation of Image Grabbing
        var grabber = setInterval(function(){
            count++;
            if (count>grabLimit) {
                clearInterval(grabber);
                showResults();
            } else {
                encoder.addFrame(ctx);
            }
        }, grabRate);
    }

    // Function to drive the canvas display of combined images
    function animate(index, length) {
        if (shouldEnd){
            return;
        }
        delay = parseInt($("#delay").val())
        logo_image = new Image();
        logo_image.src = currentImage.src;
        logo_image.onload = function(){
            const frame_image_src = sup1.get_canvas().toDataURL();
            frame_image = new Image();
            frame_image.src = frame_image_src;
            frame_image.onload = function(){
                ctx.drawImage(frame_image, 0, 0);
                ctx.drawImage(logo_image, parseInt($("#image-x-location").val()), parseInt($("#image-y-location").val()));
                try
                {
                    sup1.move_to(index);
                    index++;
                    recurse(index, length);
                }
                catch(e)
                {
                    // Force it
                    sup1.move_to(index);
                    index++;
                    recurse(index, length);
                    console.log("forced through a gif frame change " + index);
                }
            }
        }
    }

    function recurse(index, length){
        timeouts.push( setTimeout(function() {
            animate(index % length, length);
        }, delay) );
    }




    function encodeQueryData(data)
    {
        var ret = [];
        for (var d in data)
            ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
        return ret.join("&");
    }

    function httpGetAsync(theUrl, callback)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }

    /*
    * The following functions are what do the work for retrieving and displaying gifs
    * that we search for.
    */

    function getGif(query) {
        console.log(query);
        query = query.replace(' ', '+');
        var params = { 'api_key': apikey, 'q': query};
        params = encodeQueryData(params);

        // api from https://github.com/Giphy/GiphyAPI#search-endpoint 

        httpGetAsync('http://api.giphy.com/v1/gifs/search?gi' + params, function(data) {
            var gifs = JSON.parse(data);
            var rand = Math.floor(Math.random() * gifs.data.length);
            var gif = gifs.data[rand].images.fixed_width.url;
            imagediv.html("<img src='" + gif + "'>");
            list.push(gif);
            cur = cur + 1;
            console.log(gifs.data);
        });
    }

    function previous(){
        if (cur == 0){
            alert("No more previous gif.");
        } else{
            cur = cur - 1;
            imagediv.html("<img src='" + list[cur] + "'>");
        }
    }

    function next(){
        if (cur == list.length-1){
            alert("No more next gif.");
        } else {
            cur = cur + 1;
            imagediv.html("<img src='" + list[cur] + "'>");
        }
    }

    getGif("LOADINGQUERY");
    $("#BUTTONNAME").on("click", function() {
        var query = $("#INPUTQUERY").val();
        getGif(query);
    });
})