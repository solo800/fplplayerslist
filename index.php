<?php
require('vendor/autoload.php');

$handle = opendir('weeklyscores');

$game_weeks = [];

while(($file_name = readdir($handle)) !== FALSE) {
  if(strpos($file_name, '.csv') !== FALSE) array_push($game_weeks, $file_name);
}
usort($game_weeks, function($a, $b) {
  if(stripos($a, 'week') === FALSE) return 1;
  
  $a_week = (int) str_replace('.csv', '', str_replace('Week', '', $a));
  $b_week = (int) str_replace('.csv', '', str_replace('Week', '', $b));
  return $a_week > $b_week ? -1 : 1;
});
?>
<html>
  <head>
    <meta charset="utf-8">
    <title>Players List - Fantasy Premier League</title>
    <script src='jquery-1.11.3.min.js'></script>
    <script src='jquery.csv-0.71.min.js'></script>
    <!--<script src='downloadObj.js'></script>-->
    <script src='playersList.js'></script>
    <style>
      @font-face {
        font-family: 'chelsea';
        src: url('fonts/chelsea-webfont.eot');
        src: url('fonts/chelsea-webfont.eot?#iefix') format('embedded-opentype'),
             url('fonts/chelsea-webfont.woff2') format('woff2'),
             url('fonts/chelsea-webfont.woff') format('woff'),
             url('fonts/chelsea-webfont.ttf') format('truetype'),
             url('fonts/chelsea-webfont.svg#chelsearegular') format('svg');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'roboto';
        src: url('fonts/roboto-regular-webfont.eot');
        src: url('fonts/roboto-regular-webfont.eot?#iefix') format('embedded-opentype'),
             url('fonts/roboto-regular-webfont.woff2') format('woff2'),
             url('fonts/roboto-regular-webfont.woff') format('woff'),
             url('fonts/roboto-regular-webfont.ttf') format('truetype'),
             url('fonts/roboto-regular-webfont.svg#robotoregular') format('svg');
        font-weight: normal;
        font-style: normal;
      }
      html {
        height: 100%;
      }
      body {
        height: 100%;
      }
      * {
        box-sizing: border-box;
        font-family: 'roboto', 'sans-serif', 'serif';
      }
      .prem-players {
        display:none;
      }
      h1 {
        width: 100%;
        text-align: center;
        margin: 0;
        font-family: 'chelsea', 'sans-serif', 'serif';
        font-size: 3em;
      }
      .inputs {
        width: 30%;
        margin: .75% auto;
        min-width: 275px;
      }
      .inputs > * {
        float: left;
        text-align: center;
      }
      .inputs label {
        width: 50%;
      }
      .inputs > :not(label) {
        width: 40%;
        margin: 0 5%;
      }
      #build-dream-team {
        color: blue;
        text-decoration: underline;
        cursor: pointer;
      }
      article {
        width: 100%;
        margin: 0 auto;
        max-width: 1200px;
        min-width: 800px;
      }
      article.dream-team {
        display: none;
        border: 1px solid black;
        border-radius: 8px;
        position: relative;
      }
      article.suggestions {
        height: 100%;
      }
      article > div {
        width: 24.5%;
        margin: 0 .25%;
        float: left;
      }
      article > div > * {
        float: left;
      }
      article > div > div {
        width: 100%;
        margin: 0 .1%;
      }
      article > div > div.heading > * {
        border-top: 1px solid #CAC6FF;
      }
      article > div > label, article > div > input {
        width: 80%;
        margin: .5% 10%;
        text-align: center;
      }
      .dream-team div.dt-stats {
        width: 50%;
        margin: 0 25%;
      }
      .dream-team div.dt-stats > {
        width: 70%;
        margin: 0 15%;
      }
      .dream-team div.dt-stats > div > span {
        width: 33%;
      }
      .dream-team h2 {
        text-align: center;
        margin: 0;
        text-align: center;
      }
      div.player > * {
        border-width: 0;
        border-color: transparent;
        border-bottom: 1px solid #CAC6FF;
        border-right: 1px solid #CAC6FF;
      }
      div.player > *:first-child {
        border-left: 1px solid #CAC6FF;
      }
      div.player:last-child > *:last-child {
        border-right: 1px solid #CAC6FF;
      }
      div.replacement {
        position: relative;
        box-shadow: 0 0 0 1px transparent;
        margin: 0;
        transition: .3s;
      }
      div.replacement.show {
        border: 1px solid darkblue;
        margin-top: 1%;
      }
      div.replacement h3 {
        text-align: center;
        font-size: 1em;
        margin: 0;
      }
      span.clear-selection {
        border: 0;
        width: 3%;
        position: absolute;
        top: 0;
        left: 1%;
        color: red;
        transform: scale(1);
        transition: .3s;
      }
      span.clear-selection:hover {
        cursor: pointer;
        transform: scale(1.5);
      }
      .dream-team span.clear-selection {
        width: 1%;
      }
      article > div > div span {
        width: 14%;
        float: left;
        font-size: .9em;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      article > div > div span.long {
        width: 29%;
      }
      div.heading span {
        font-weight: bold;
      }
      div.player > * {
        transition: .3s;
        background-color: transparent;
      }
      article:not(.dream-team) div div.player:not(.heading):hover > * {
        background-color: #CAC6FF;
        cursor: pointer;
      }
      div.player.player-suggestion > span {
        border-color: red;
      }
      div.player.player-suggestion > span:last-child {
        border-color: red;
      }
      article > div > h3 {
        font-size: 1em;
        margin: 0;
        width: 100%;
        text-align: center;
        border: 1px solid red;
        border-top: 0;
      }
      .clear-fix:before, .clear-fix:after {
        content: "";
        display: table;
      }
      .clear-fix:after {
        clear: both;
      }
      .clear-fix {
        zoom: 1;
        /* IE6&7 */
      }
    </style>
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
  </body>
</html>