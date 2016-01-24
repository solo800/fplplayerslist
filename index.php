<?php
require('vendor/autoload.php');

$handle = opendir('weeklyscores');

$game_weeks = [];

while(($file_name = readdir($handle)) !== FALSE) {
  if(strpos($file_name, '.csv') !== FALSE) array_push($game_weeks, $file_name);
}
usort($game_weeks, function($a, $b) {
  if(stripos($a, 'week') === FALSE) return -1;

  $a_week = (int) str_replace('.csv', '', str_replace('Week', '', $a));
  $b_week = (int) str_replace('.csv', '', str_replace('Week', '', $b));
  return $a_week > $b_week ? 1 : -1;
});
?>
<html>
  <head>
    <meta charset="utf-8">
    <title>Players List - Fantasy Premier League</title>
    <link rel='stylesheet' type='text/css' href='css/style.css'/>
  </head>
  <body>
    <h1>FPL Players List</h1>
    <div class='inputs clear-fix'>
      <label>Game Week</label>
      <label id='build-dream-team'>Build Dream Team</label>
      <select id='game-week'>
        <?php
        $game_weeks = array_reverse($game_weeks);
        foreach($game_weeks as $week) {
          if(strpos($week, '00') !== FALSE) {
            $disp_week = 'Last Season';
          }
          else {
            $disp_week = substr_replace(str_replace('.csv', '', $week), ' ', strpos($week, 'Week') + 4, 0);
          }

          echo "<option value='$week'>$disp_week</option>";
        }
        ?>
      </select>
      <input type='text' placeholder='Team Cost'/>
    </div>
    <article class='dream-team clear-fix'>
      <h2>Dream Team</h2>
      <div class='dt-stats clear-fix'>
        <div class='heading player'>
          <span>Value</span>
          <span>Points</span>
          <span>Cost</span>
        </div>
      </div>
      <div class='g clear-fix'>
        <div class='heading player'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
      </div>
      <div class='d clear-fix'>
        <div class='heading player'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
      </div>
      <div class='m clear-fix'>
        <div class='heading player'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
      </div>
      <div class='f clear-fix'>
        <div class='heading player'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
      </div>
    </article>
    <article class='suggestions clear-fix'>
      <div class='g clear-fix'>
        <label>Goalkeepers</label>
        <input type='text' id='goalkeepers'/>
        <div class='heading player'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
        <div class='replacement'></div>
      </div>
      <div class='d clear-fix'>
        <label>Defenders</label>
        <input type='text' id='defenders'/>
        <div class='heading player'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
        <div class='replacement'></div>
      </div>
      <div class='m clear-fix'>
        <label>Midfielders</label>
        <input type='text' id='midfielders'/>
        <div class='heading player'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
        <div class='replacement'></div>
      </div>
      <div class='f clear-fix'>
        <label>Forwards</label>
        <input type='text' id='forwards'/>
        <div class='heading player'>
          <span class='long'>Name</span>
          <span class='long'>Team</span>
          <span>Pts</span>
          <span>&#163;</span>
          <span>Val</span>
        </div>
        <div class='replacement'></div>
      </div>
    </article>

    <!-- Scripts -->
    <script src='jquery-1.11.3.min.js'></script>
    <script src='jquery.csv-0.71.min.js'></script>
    <!--<script src='downloadObj.js'></script>-->
    <script src='playersList.js'></script>
    <!-- End Scripts -->
  </body>
</html>
