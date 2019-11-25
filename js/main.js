// START Constants

    var GAME_STATE               = 'homescreen';
    var GAME_LEVEL               = 1;
    var SCREEN_WIDTH 	         = $(window).width();
    var SCREEN_HEIGHT 	         = $(window).height();

    // Android
   //SCREEN_WIDTH                = 360;
    //SCREEN_HEIGHT               = 565; //640

    // iPod
    //SCREEN_WIDTH              = 320;
    //SCREEN_HEIGHT             = 356; //480;

    var BOARD_BOTTOM_HEIGHT     = 34;
    var BOARD_WIDTH             = SCREEN_WIDTH;
    var BOARD_HEIGHT            = SCREEN_HEIGHT - BOARD_BOTTOM_HEIGHT;

    var HERO_WIDTH              = 66;
    var HERO_HEIGHT             = 66;
    var HERO_POSITION_TOP       = 0;
    var HERO_POSTIION_LEFT      = 0;
    var HERO_DIRECTION_MOVE     = ''; // up, down, left, right
    var HERO_DIRECTION_MOVE_NEW = '';
    var HERO_MOVE_BASE_SPEED    = 8;
    var HERO_MOVE_ACTUAL_SPEED  = 0;
    var HERO_MOVE_INCREMENT     = 4;

    var EXPLOSION_WIDTH         = 180;
    var EXPLOSION_HEIGHT        = 165;

    var CANDY_WIDTH             = 50;
    var CANDY_HEIGHT            = 55;
    var CANDY_POSITION_TOP      = 0;
    var CANDY_POSITION_LEFT     = 0;
    var CANDY_SPEED             = 10;
    var CANDY_DIRECTION         = 'down';
    var CANDY_COUNT             = 0;    
    
    var DOOR_WIDTH              = 50;
    var DOOR_HEIGHT             = 55;
    var DOOR_POSITION_TOP       = 0;
    var DOOR_POSITION_LEFT      = 0;
    var DOOR_SHOWN              = false;

    var ENEMY_WIDTH             = 45;
    var ENEMY_HEIGHT            = 50;
    var ENEMIES_ON_SCREEN       = 0; // will increment to "1" in GameReset(); -- not used??
    var ENEMY_COUNT             = 0;
    var arr_ENEMY               = [];

    var THRESHOLD_HAVE          = 0;
    var THRESHOLD_BASE          = 5; 
    var THRESHOLD_NEED          = 0; // increments by 1 every one. Reset to "base" at the start

    var MOVE_BACKGROUND         = 0;
    
    var heroAnim = new gf.animation({
        url : "images/hero.png"
    });

    var enemyAnim = new gf.animation({
        url : "images/raft_bomb.png"
    });

    var candyAnim = new gf.animation({
        url : "images/raft_clown_01.png"
    });

    var DoorAnim = new gf.animation({
        url : "images/raft_treasure.png"
    });

    var explosionAnim = new gf.animation({
        url : "images/explosion.png"
    });
  
// END Constants


$( document ).ready(function() {
/*
    sound_explosion = new sound();
    sound_explosion.preload("sounds/explosion");

    sound_powerup1 = new sound();
    sound_powerup1.preload("sounds/powerup1");

    sound_powerup2 = new sound();
    sound_powerup2.preload("sounds/powerup2");
*/
    gf.startGame(initialize); // used for preloading images
});

    // this is needed so they don't accidentally "select/highlight" the items
    document.onselectstart = document.onmousedown = function() { return false; }

function initialize() {

    //objects animation
    wow = new WOW(
      {
        animateClass: 'animated',
        offset:       100
      }
    );
    wow.init();

    // This is called in the pageinit, via: gf.startGame(initialize);
    // will show the button that executes GameReset()
    $('#container').width(SCREEN_WIDTH).height(SCREEN_HEIGHT);
    $("#container").prepend("<div id='board' class='main_board' style='display: none; width: " + BOARD_WIDTH + "px; height: " + BOARD_HEIGHT+ "px;'>");
    $("#board").css("display", "block");

    GameReset();

}


function GameReset(){
    
    GAME_STATE = 'homescreen';

    $('#how_to_play').show(); // need to re-show after new game
    $('#game_over, #advertisement, #new_high_score, #instructions_to_move_hero').hide();

    // reset
    ENEMY_COUNT         = 0;
    ENEMIES_ON_SCREEN   = 1;
    CANDY_COUNT         = 0;
    DOOR_SHOWN          = false;    
    GAME_LEVEL          = 1;
    arr_ENEMY           = [];
    MOVE_BACKGROUND     = 0;
    CANDY_DIRECTION     = 'down';

    $('.enemy, .candy, .door, #hero').remove();

    // calculate center for where the player starts
    // store in the variable because that is what will be used to move the hero
    HERO_POSITION_TOP   = (BOARD_HEIGHT/2) - 30;
    HERO_POSTIION_LEFT  = (BOARD_WIDTH/2) - 30;
    
    gf.addSprite("board","hero",{width: HERO_WIDTH, height: HERO_HEIGHT, x:HERO_POSTIION_LEFT, y: HERO_POSITION_TOP});
    gf.setAnimation("hero", heroAnim);
    
    THRESHOLD_HAVE          = 0; 
    THRESHOLD_NEED          = THRESHOLD_BASE;

    HERO_MOVE_ACTUAL_SPEED  = HERO_MOVE_BASE_SPEED;
    HERO_DIRECTION_MOVE     = '';
    HERO_DIRECTION_MOVE_NEW = '';

    UpdateCurrentStats();
    AddEnemy();
    AddCandy(); // needs to be done AFTER the threshold was reset

    $('.enemy, .candy, #hero').hide(); // hide until the user actually starts the game

    // swipe
     $(function() {     
      $("#board").swipe( {
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
            GameStart();
            HERO_DIRECTION_MOVE_NEW = direction;

                if (HERO_DIRECTION_MOVE != HERO_DIRECTION_MOVE_NEW) {
                    HERO_DIRECTION_MOVE = HERO_DIRECTION_MOVE_NEW;
                    HERO_MOVE_ACTUAL_SPEED = HERO_MOVE_BASE_SPEED;
                    //console.log('set to base' + HERO_MOVE_ACTUAL_SPEED);
                } else {
                    //console.log('increment, before:' + HERO_MOVE_ACTUAL_SPEED);
                    HERO_MOVE_ACTUAL_SPEED =  HERO_MOVE_ACTUAL_SPEED + HERO_MOVE_INCREMENT;
                    //console.log('increment, after:' + HERO_MOVE_ACTUAL_SPEED);
                }
        },
         threshold:0
      });
    });

}

function GameStart() {

    if (GAME_STATE == 'homescreen') {

        $('.enemy, .candy, #hero').show();

        $( '#how_to_play').fadeOut( "slow", function() {

            // reset the game loop: if NOT here, then the GameLoop keeps repeating every instance of new game (so everything is faster)
            gf.callbacks = [];
            gf.addCallback(GameLoop, 90);
            // GameLoop();

        });
        GAME_STATE = 'play';
    }

}

function GameLoop() {
        
    MOVE_BACKGROUND-=1;
    $('.maincontainer').css('background-position', MOVE_BACKGROUND + 'px 0');

    if (GAME_STATE == 'play') {

        EnemiesMove(); // collision detection of enemy + hero in here
        CandyMove(); // collision detection of candy/doors + hero in here
        HeroMove();
    }
}

function AddEnemy() {

    var direction   = 'right';
    var x_coord     = 0;
    var y_coord     = 0;

    // If the hero is near an edge, force a horiztonal/vertical    
    var Hero_X = HERO_POSTIION_LEFT;
    var Hero_Y = HERO_POSITION_TOP;

    if (Hero_Y < HERO_HEIGHT + (HERO_HEIGHT * 2.5)) {
        
        //console.log('near the top');
        x_coord     = Math.floor((Math.random() * (BOARD_WIDTH - ENEMY_HEIGHT) ));
        y_coord     = BOARD_HEIGHT - ENEMY_HEIGHT;
        direction   = 'up';

    } else if ( Hero_Y > BOARD_HEIGHT - (HERO_HEIGHT * 2.5) ) {
        
        //console.log('near the bottom');
        x_coord     = Math.floor((Math.random() * (BOARD_WIDTH - ENEMY_WIDTH) ));
        y_coord     = 0;
        direction   = 'down';
        
    } else if (Hero_X < HERO_WIDTH + (HERO_WIDTH * 2.5)) {

        //console.log('near the left');
        x_coord     = BOARD_WIDTH - ENEMY_WIDTH;
        y_coord     = Math.floor((Math.random() * (BOARD_HEIGHT - ENEMY_HEIGHT) ));
        direction   = 'left';

    } else if (Hero_X > BOARD_WIDTH - (HERO_WIDTH * 2.5)) {

        //console.log('near the right');
        x_coord     = 0;
        y_coord     = Math.floor((Math.random() * (BOARD_HEIGHT - ENEMY_HEIGHT) ));
        direction   = 'right';

    } else {

        // not near an edge: be somewhat random
        if (ENEMY_COUNT % 2 == 0 ) {
            direction   = 'down';      
            x_coord     = Math.floor((Math.random() * (BOARD_WIDTH - ENEMY_WIDTH) ));
            y_coord     = 0;
        } else {
            direction   = 'right';
            x_coord     = 0;
            y_coord     = Math.floor((Math.random() * (BOARD_HEIGHT - ENEMY_WIDTH) ));
        }

    }

    
	gf.addSprite("board","enemy_" + ENEMY_COUNT ,{width: ENEMY_WIDTH, height: ENEMY_HEIGHT, x: x_coord, y: y_coord});
	gf.setAnimation("enemy_" + ENEMY_COUNT, enemyAnim);

    // this has to be AFTER the enemy is added to the board
    $('#enemy_' + ENEMY_COUNT ).addClass('enemy');
    
    // add properties for it to move
    arr_ENEMY[ENEMY_COUNT] = [direction, x_coord , y_coord];    

	ENEMY_COUNT++;
    ENEMIES_ON_SCREEN++;

}


function AddCandy() {

    // Add Candy OR a Door
    if (THRESHOLD_HAVE >= THRESHOLD_NEED) {
       
        if (DOOR_SHOWN == false) {

            // set x/y coordinates so it's somewhere in the center
            var a = BOARD_WIDTH - Math.floor(BOARD_WIDTH * 0.25);
            var b = BOARD_HEIGHT - Math.floor(BOARD_HEIGHT * 0.25);
            
            var x_coord = Math.floor((Math.random() * (a) ));
            var y_coord = Math.floor((Math.random() * (b) ));
            
            gf.addSprite("board","thedoor" ,{width: DOOR_WIDTH, height: DOOR_HEIGHT, x: x_coord, y: y_coord});
            gf.setAnimation("thedoor", DoorAnim);
            $('#thedoor').addClass('door');

            DOOR_POSITION_LEFT  = x_coord;
            DOOR_POSITION_TOP   = y_coord;

            DOOR_SHOWN = true;

        }

   } else { // add Candy


        if (GAME_LEVEL == 1) {
            CANDY_DIRECTION = 'down';
        } else {

            if (Math.floor((Math.random() * 10) + 1) > 5)
                CANDY_DIRECTION = 'down';
            else
                 CANDY_DIRECTION = 'up';            
        }


        var x_coord = Math.floor((Math.random() * (BOARD_WIDTH - CANDY_WIDTH) ));

         if (x_coord > BOARD_WIDTH - CANDY_WIDTH) {
            x_coord = BOARD_WIDTH - CANDY_WIDTH;
         }

        if (CANDY_DIRECTION == 'down') {
            var y_coord = 0;            
        } else {
            var y_coord = BOARD_HEIGHT - CANDY_HEIGHT;
        }


        

        gf.addSprite("board","candy_" + CANDY_COUNT ,{width: CANDY_WIDTH, height: CANDY_HEIGHT, x: x_coord, y: y_coord});
        gf.setAnimation("candy_" + CANDY_COUNT, candyAnim);

        $('#candy_' + CANDY_COUNT ).addClass('candy');

        

        CANDY_POSITION_LEFT = x_coord;
        CANDY_POSITION_TOP  = y_coord;
   }
}


function EnemiesMove() {

    if (GAME_STATE == 'play') {

        // it's easier if I don't use a FOR loop because
        // after enemies are cleared out,and new ones come in,
        // the "new" enemy would have an ID of 4, not 0:
        // the FOR loop wouldn't know where to start
        //for (i = 0; i < ENEMY_COUNT; i++) {
        for (i in arr_ENEMY) {
           
            j = arr_ENEMY[i];
            
            direction       = j[0];
            x_coord         = parseInt(j[1]);
            y_coord         = parseInt(j[2]);
            speed           = 3;           
            
            if (direction == 'down') {

                if ( (y_coord + speed) > (BOARD_HEIGHT - ENEMY_HEIGHT) ) {         
                    $('#enemy_' + i ).css({top:  BOARD_HEIGHT - ENEMY_HEIGHT });
                    y_coord     = BOARD_HEIGHT -  ENEMY_HEIGHT;
                    direction   = "up";
                } else {
                    $('#enemy_' + i ).css({top: y_coord + speed });                  
                     y_coord    = y_coord + speed;
                }

            } else if (direction == 'up') {

                if ( (y_coord - speed) < 0 ) {
                    $('#enemy_' + i ).css({top: 0});
                    y_coord     = 0;
                    direction   = "down";
                } else {
                    $('#enemy_' + i ).css({top:y_coord - speed}); 
                    y_coord     = y_coord - speed;
                }

            } else if (direction == 'right') {

               if ( (x_coord + speed) >= BOARD_WIDTH - ENEMY_WIDTH ) {
                    $('#enemy_' + i ).css({left: BOARD_WIDTH - ENEMY_WIDTH });
                    x_coord     = BOARD_WIDTH - ENEMY_WIDTH;
                    direction   = "left";
                } else {
                    $('#enemy_' + i ).css({left: x_coord + speed});
                     x_coord    = x_coord + speed;
                }

            } else if (direction == 'left') {

                if ( (x_coord - speed) <= 0 ) {                                        
                    $('#enemy_' + i ).css({left: 0 });
                    x_coord     = 0;
                    direction   = "right";
                } else {
                    $('#enemy_' + i ).css({left: x_coord - speed });
                    x_coord     = x_coord - speed;
                }

            }
        
            arr_ENEMY[i]    = [direction, x_coord , y_coord];

            // Check for collision detection here
            if (collision_with_enemy(x_coord, y_coord) == true) {
                GameOver(i); // pass in which enemy collided so that image can change
            }

        }

    }
}


function CandyMove() {

    if (GAME_STATE == 'play') {

        if( CANDY_DIRECTION =='down') {

            if ( CANDY_POSITION_TOP > (BOARD_HEIGHT - CANDY_HEIGHT - 5) ) {

                // If the candy reaches the BOTTOM, show a new one.
                $('#candy_' + CANDY_COUNT ).remove();
                AddCandy();

            } else {

                $('#candy_' + CANDY_COUNT ).css({top: CANDY_POSITION_TOP + CANDY_SPEED});
                CANDY_POSITION_TOP = CANDY_POSITION_TOP + CANDY_SPEED;

            }

        } else { // direction: up

            if ( CANDY_POSITION_TOP <= 0 ) {

                // If the candy reaches the TOP, show a new one.
                $('#candy_' + CANDY_COUNT ).remove();
                AddCandy();

            } else {

                $('#candy_' + CANDY_COUNT ).css({top: CANDY_POSITION_TOP - CANDY_SPEED});
                CANDY_POSITION_TOP = CANDY_POSITION_TOP - CANDY_SPEED;

            }

        }

        // START collision detection
        
            // Did the hero touch a candy or the door?
            // only ONE will appear at a time: check for collision detection of door OR candy
            if (DOOR_SHOWN == true) {

                if (collision_with_door(x_coord, y_coord) == true) {
                   
                   //sound_powerup2.play();

                    // Basically reset the screen
                    DOOR_SHOWN    = false;
                    $('.door').remove();

                    ENEMIES_ON_SCREEN   = 1;
                    $('.enemy').remove();
                    arr_ENEMY = [];

                    // Increase the threshold:
                    // make it harder for the next one to appear
                    // to be done *before* showing the next candy
                    THRESHOLD_HAVE = 0;
                    THRESHOLD_NEED++;

                    GAME_LEVEL++;

                    UpdateCurrentStats();
                    AddEnemy();
                    AddCandy();
                
                }

            } else {
                
                if (collision_with_candy(x_coord, y_coord) == true) {
                
                    //sound_powerup1.play();
                    $('.candy').remove();
                    CANDY_COUNT++;
                    THRESHOLD_HAVE++;
                    UpdateCurrentStats();
                    AddCandy();
                    AddEnemy();
                }
            }

            // The game has to stop some time
            if (CANDY_COUNT == 997) {
                alert('WOW, good job! \n\n YOU WIN!! \n\n Either you\'re really good, or you\'re cheating :)');
                GameOver(0);
            }

        // END collision detection
       
    }
}

function HeroMove() {

    if ((GAME_STATE == 'play') && (HERO_DIRECTION_MOVE != '')) {
            
        // direction and speed defined in the swipe
        // store hero position in constants we don't have to read the DOM

        // only move the hero if it's NOT outside the border
        // added "2" for down/right to compensate

        if ((HERO_DIRECTION_MOVE == "up") && (HERO_POSITION_TOP >=0)) {
            HERO_POSITION_TOP = parseInt(HERO_POSITION_TOP - HERO_MOVE_ACTUAL_SPEED);
            if (HERO_POSITION_TOP < 0) HERO_POSITION_TOP = 0;
            $('#hero').css('top', HERO_POSITION_TOP);                
        }

        if ((HERO_DIRECTION_MOVE == "down") && (HERO_POSITION_TOP + HERO_HEIGHT <= BOARD_HEIGHT )) {
            HERO_POSITION_TOP = parseInt(HERO_POSITION_TOP + HERO_MOVE_ACTUAL_SPEED);
            if ( HERO_POSITION_TOP + HERO_HEIGHT > BOARD_HEIGHT - HERO_HEIGHT ) HERO_POSITION_TOP = BOARD_HEIGHT - HERO_HEIGHT;
            $('#hero').css('top', HERO_POSITION_TOP);                
        }

        if ((HERO_DIRECTION_MOVE == "left") && (HERO_POSTIION_LEFT >=0)) {
            HERO_POSTIION_LEFT = parseInt(HERO_POSTIION_LEFT - HERO_MOVE_ACTUAL_SPEED);
            if (HERO_POSTIION_LEFT < 0) HERO_POSTIION_LEFT = 0;
            $('#hero').css('left', HERO_POSTIION_LEFT);                
        }

        if ((HERO_DIRECTION_MOVE == "right") && (HERO_POSTIION_LEFT <= BOARD_WIDTH - HERO_WIDTH - 5)) {
            HERO_POSTIION_LEFT = parseInt(HERO_POSTIION_LEFT + HERO_MOVE_ACTUAL_SPEED);
            if (HERO_POSTIION_LEFT > BOARD_WIDTH) HERO_POSTIION_LEFT = BOARD_WIDTH - 5;
            $('#hero').css('left', HERO_POSTIION_LEFT);                
        }

    }
}

function UpdateCurrentStats() {

    $('#current_stats_level').html(GAME_LEVEL);
    $('#current_stats_threshold').html(THRESHOLD_HAVE + '/' + THRESHOLD_NEED);
    $('#current_stats_total').html(CANDY_COUNT);

}

function GameOver(enemy_collided_with) {

    //sound_explosion.play(false);
   
    // Remove candy/doors after an explosion, incase it was somehow added after a collision
   	$('.door, .candy').hide();

    // there's less of a delay if I do NOT set the image in the CSS, and use the gf.setAnimation instead
    //$('#enemy_' + enemy_collided_with ).css({width: 120, height:111, backgroundImage:'url(img/explosion.png)'});
    $('#enemy_' + enemy_collided_with ).css({width: EXPLOSION_WIDTH, height:EXPLOSION_HEIGHT});
    gf.setAnimation("enemy_" + enemy_collided_with, explosionAnim);

    // Check for high score
    var PreviousHighScore = RetrieveHighScore();
    $('#previous_high_score').html( PreviousHighScore );

    if (CANDY_COUNT >= PreviousHighScore) {
        $('#previous_high_score').html(CANDY_COUNT); // update the screen to show the NEW high score
        $('#new_high_score').show();
        SetHighScore(CANDY_COUNT);
    }

    $('#game_over').show();
    $('#advertisement').show();
    $('#your_score').html(CANDY_COUNT);
    GAME_STATE = 'gameover';
}



// START Collision Detection

    function comparePositions( p1, p2 ) {
        var r1, r2;
        r1 = p1[0] < p2[0] ? p1 : p2;
        r2 = p1[0] < p2[0] ? p2 : p1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    }

    function collision_with_enemy( enemy_position_left, enemy_position_top ) {        
        var pos1 = [ [HERO_POSTIION_LEFT, HERO_POSTIION_LEFT + HERO_WIDTH ], [ HERO_POSITION_TOP, HERO_POSITION_TOP + HERO_HEIGHT ]],
            pos2 = [ [enemy_position_left, enemy_position_left + ENEMY_WIDTH ], [ enemy_position_top, enemy_position_top + ENEMY_HEIGHT ]];
        return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
    };

    function collision_with_candy() {
        var pos1 = [ [HERO_POSTIION_LEFT, HERO_POSTIION_LEFT + HERO_WIDTH ], [ HERO_POSITION_TOP, HERO_POSITION_TOP + HERO_HEIGHT ]],
            pos2 = [ [CANDY_POSITION_LEFT, CANDY_POSITION_LEFT + CANDY_WIDTH], [ CANDY_POSITION_TOP, CANDY_POSITION_TOP + CANDY_HEIGHT ]];
        return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
    };
    

    function collision_with_door() {
        var pos1 = [ [HERO_POSTIION_LEFT, HERO_POSTIION_LEFT + HERO_WIDTH ], [ HERO_POSITION_TOP, HERO_POSITION_TOP + HERO_HEIGHT ]],
            pos2 = [ [DOOR_POSITION_LEFT, DOOR_POSITION_LEFT + DOOR_WIDTH], [ DOOR_POSITION_TOP, DOOR_POSITION_TOP + DOOR_HEIGHT ]];
        return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
    };

// END Collision Detection


/******************/
// Generic

    function PlaySound(theSound) {

        theSound.play(false);
        //theSound.stop();
    }

    // High Scores
        function SetHighScore(TheScore) {
            localStorage.setItem("HighScore", TheScore);
        }

        function RetrieveHighScore() {
            var x = localStorage.getItem("HighScore");
            x = x || 0; // convert to 0 if necessary;
            return x;
        }
/******************/