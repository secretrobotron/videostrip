(function(){
  window.VideoStrip = function( options ) {
    var canvas = document.getElementById( options.canvas ),
        canvasWidth = canvas.width,
        canvasHeight = canvas.height,
        ctx = canvas.getContext( '2d' ),
        source = document.getElementById( options.source ),
        vignet = document.createElement( "canvas" ),
        frame = document.createElement( "canvas" ),
        frameCtx,
        adjustedWidth;

    ctx.fillStyle = "#000";
    ctx.fillRect( 0, 0, canvasWidth, canvasHeight );
    ctx.globalAlpha = 0.1;

    function drawFrame( e ) {
      var canvasX = canvasWidth/source.duration*source.currentTime-adjustedWidth/2;

      frameCtx.clearRect( 0, 0, frame.width, frame.height );
      frameCtx.globalAlpha = .5;
      frameCtx.globalCompositeOperation = "destination-atop";
      frameCtx.drawImage( source, 0, 0, frame.width, frame.height );
      frameCtx.drawImage( vignet, 0, 0, frame.width, frame.height );

      ctx.globalCompositeOperation = "darker";
      ctx.globalAlpha = 1;
      ctx.drawImage( frame, canvasX, 0, adjustedWidth, canvasHeight );
    } //drawFrame

    function videoReady( e ) {
      adjustedWidth = source.videoWidth/source.videoHeight*canvasHeight;
      frame.width = source.videoWidth;
      frame.height = source.videoHeight;
      frameCtx = frame.getContext( "2d" );
      vignet.width = source.videoWidth;
      vignet.height = source.videoHeight;
      var vignetCtx = vignet.getContext( '2d' );
      vignetCtx.globalAlpha = 1;
      vignetCtx.globalCompositeOperation = "nonexistent";
      vignetCtx.fillStyle = "rgba(0, 0, 0, 0.4)";
      for ( var i=0; i<vignet.width/2; i+=5 ) {
        vignetCtx.beginPath();
        vignetCtx.arc( vignet.width/2, vignet.height/2, i, 0, Math.PI*2, true );
        vignetCtx.fill();
      }

      var canvasLeft = canvas.getBoundingClientRect().left;

      canvas.addEventListener( 'mousedown', function( e ) {
        var drawing = false;
        function onSeek( e ) {
          drawFrame();
          source.removeEventListener( 'seeked', onSeek, false );
          drawing = false;
        } //onSeek
        function startDraw( e ) {
          if ( !drawing ) {
            source.addEventListener( 'seeked', onSeek, false );
            source.currentTime = source.duration/canvas.width*(e.clientX-canvasLeft);
            drawing = true;
          } //if
        } //draw
        canvas.addEventListener( 'mouseup', function( e ) {
          canvas.removeEventListener( 'mousemove', startDraw, false );
        }, false );
        canvas.addEventListener( 'mousemove', startDraw, false );
        startDraw( e );
      }, false );

    } //videoReady

    if ( source.duration ) {
      videoReady();
    }
    else {
      source.addEventListener( 'loadedmetadata', videoReady, false );
    } //if
  };
})();
