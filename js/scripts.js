let media_player_playlists;  

$(document).on("change", "#checkbox-topic-category input[type='checkbox']", function() {

    // uncheck all checkboxes except the one that was clicked
    $('#checkbox-topic-category input[type="checkbox"]').not(this).prop('checked', false);

});


$(document).on("click", "#button_copy_to_clipboard", async function() {
    const textarea_generated_post = $("#textarea-generated-post").val();
    try {
        await navigator.clipboard.writeText(textarea_generated_post);
        UIkit.notification("Text was copied to clipboard!", {status: 'success', timeout: 5000})
    } catch (err) {
        console.error("Failed to copy text: ", err);
    }
});


$(document).on("click", "#button_generate_forum_post_text", (e) => {

    e.preventDefault();
    
    // textarea values 
    
    const textarea_system_info = $("#textarea-system-info").val() || "Not Provided";

    const textarea_logs_console = $("#textarea-logs-console").val() || "Not Provided";

    const textarea_logs_terminal = $("#textarea-logs-terminal").val() || "Not Provided";

    const textarea_behaviour_desired = $("#textarea-behaviour-desired").val() || "Not Provided";

    const textarea_behaviour_actual = $("#textarea-behaviour-actual").val() || "Not Provided";

    const textarea_steps_to_reproduce = $("#textarea-steps-to-reproduce").val() || "Not Provided";


    // select values

    const select_interface_options_text = $("#select-interface-options option:selected").map(function() {
        return $(this).text();
    }).get().join(', ') || "Not Provided";

    const select_language_model_options_text = $("#select-language-model-options option:selected").map(function() {
        return $(this).text();
    }).get().join(', ') || "Not Provided";

    const select_symbols_options_text = $("#select-symbols-options option:selected").map(function() {
        return $(this).text();
    }).get().join(', ') || "Not Provided";

    const select_submission_options_text = $("#select-submission-options option:selected").map(function() {
        return $(this).text();
    }).get().join(', ') || "Not Provided";


    // checkbox values

    const topic_categories = $('input[name="topic-category"]:checked').map(function() {
        return this.value;
    }).get();

    const topic_categories_text = topic_categories.length > 0 ? topic_categories.join(', ') : "Not Provided";

    // add the values to the generated text area
const generated_text = `**Topic Category**   
${topic_categories_text}  
  
**System Info**  
${textarea_system_info}  
  
**Interface**  
${select_interface_options_text}  
  
**Model**  
${select_language_model_options_text}  
  
**Symbols**  
${select_symbols_options_text}  
  
**Submission**    
${select_submission_options_text}  
  
**Console Logs**  
${textarea_logs_console}  
  
**Terminal Logs**  
${textarea_logs_terminal}  
  
**Desired Behaviour**  
${textarea_behaviour_desired}  
  
**Actual Behaviour**  
${textarea_behaviour_actual}  
  
**Steps to Reproduce**  
${textarea_steps_to_reproduce}  
  
  
Please add any screenshots or additional information you think would be helpful.  
  
Ensure you have redacted any sensitive information before posting.  
  
`;

    $("#textarea-generated-post").val(generated_text);

});

// media player events 
$(document).on('click', '.playlist-item', (event) => {
    const $this = $(event.currentTarget);
    const video_src = $this.data('src');
    const video_type = $this.data('type');
    load_video(video_src, video_type);
});

// update the event handler to call load_playlist
$(document).on('change', '#playlist', (event) => {  
    const $this = $(event.currentTarget);
    const selected_playlist = $this.val();
    //console.log(`selected_playlist is:  ${selected_playlist}`);
    load_playlist(selected_playlist);
});


$(document).ready(function() {
    //console.log("ready");
    generate_triage_helper_table_rows();
    instantiate_media_player();
});


const generate_triage_helper_table_rows = async () => {
    try {
        const response = await fetch("data/data.json");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        //console.log(data);

        const $table = $("#triage-helper-table"); // select the table
        const $table_body = $table.find("tbody"); // select the table body

        data.forEach(item => {
            //console.log(item);
            const $tr = $("<tr>");
            $tr.append($("<td>").text(item.id));
            $tr.append($("<td>").text(item.category));
            $tr.append($("<td>").text(item.summary));
            $tr.append($("<td>").text(item.operating_system));
            $tr.append($("<td>").text(item.occurrence));
            $tr.append($("<td>").html(`<span class="triage-helper-status ${item.status.class}">${item.status.text}</span>`));
            $tr.append($("<td>").html(`<span class="triage-helper-priority ${item.priority.class}">${item.priority.text}</span>`));
            $tr.append($("<td>").html(item.interface));
            $tr.append($("<td>").text(item.models));
            $tr.append($("<td>").text(item.symbols));
            $tr.append($("<td>").html(`<span class="triage-helper-submission ${item.submission.class}">${item.submission.text}</span>`));

            // wrap related topics in <a> tags
            const related_topics_links = item.related_topics.split(', ').map(topic_id => {
                return `<a class="triage-helper-related-topic" href="https://forum.cursor.com/t/${topic_id}" target="_blank">${topic_id}</a>`;
            }).join(', ');
            $tr.append($("<td>").html(related_topics_links));

            $table_body.append($tr);
        });
    } catch (error) {
        console.error("Failed to fetch data: ", error);
    }
}


const instantiate_media_player = async () => {
    try {
        const response = await fetch("data/playlists.json");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        //console.log(data);

        media_player_playlists = data.media_player_playlists;
        const media_player_starting_playlist_name = "Third Party - Cursor Overview";

        let playlist_options_html = '';

        media_player_playlists.forEach(playlist => {
            playlist_options_html += `<option value="${playlist.playlist_name}">${playlist.playlist_name}</option>`;
          });

        const media_player_html = `
            <div class="media-player">
                <div class="video-container">
                  <div id="video-player-container"></div>
                </div>
                <div class="playlist-container">
                  <div class="playlist-select">
                    <select id="playlist" class="uk-select">${playlist_options_html}</select>
                  </div>
                  <div class="playlist-items"></div>
                </div>
              </div>
        `; 

        $("#media-player-container").html(media_player_html);

        load_playlist(media_player_starting_playlist_name);

    } catch (error) {
        console.error("Failed to fetch data: ", error);
    }
}

const load_playlist = (playlist_name) => {

    //console.log(`loading playlist: ${playlist_name}`);

    if (!media_player_playlists) {
      console.error("Media player playlists not loaded. Load playlist aborted.");
      return;
    }

    // debug: log all playlist names
    // media_player_playlists.forEach((playlist: Playlist) => {
    //   console.log(`available playlist: ${playlist.playlist_name}`);
    // });

    // find the playlist by name
    const selected_playlist = media_player_playlists.find(playlist => playlist.playlist_name.trim() === playlist_name.trim());

    if (!selected_playlist) {
      console.error(`Playlist ${playlist_name} not found.`);
      return;
    }

    let playlist_items_html = '';

    selected_playlist.videos.forEach(video => {
      playlist_items_html += `
        <div class="playlist-item" data-src="${video.video_src}" data-type="${video.type}">
          <!--<img src="${video.thumbnail_src}" alt="${video.title_line_2} Thumbnail">-->
          <div>
          <p class="playlist-video-item-title-line-1">${video.title_line_1}</p>
          <p class="playlist-video-item-title-line-2">${video.title_line_2}</p>
          <p class="playlist-video-item-duration">${video.duration}</p>
          </div>
        </div>
      `;
    });

    $('.playlist-items').html(playlist_items_html);

    // load the first video in the selected playlist
    if (selected_playlist.videos.length > 0) {
      const first_video = selected_playlist.videos[0];
      //console.log(`loading first video: ${first_video.video_src}, type: ${first_video.type}`);
      load_video(first_video.video_src, first_video.type);
    }

}

const load_video = (src, type) => {

    const $video_player_container = $('#video-player-container');
    $video_player_container.empty(); // clear the current video or iframe

    if (type === 'local') {

      // check if the player is already initialized
      const player = videojs.getPlayer('vid1');
      if (player) {
        player.dispose(); // dispose the existing player
      }

      // create a new video element for local videos
      const video_element = $('<video>', {
        id: 'vid1', // give a unique id to the video element
        class: 'video-js vjs-default-skin',
        html: `<source src="${src}" type="video/mp4">your browser does not support the video tag.`,
        css: {
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }
      });
      
      $video_player_container.append(video_element);
      
      // explicitly instantiate video.js on the new video element
      videojs('vid1', {
        controls: true,
        preload: 'auto',
        fill: true 
      });
      
    } else if (type === 'youtube') {
      // create an iframe for youtube videos
      const iframe_element = $('<iframe>', {
        src: src,
        allowfullscreen: true,
        frameborder: 0,
        css: {
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }
      });
      $video_player_container.append(iframe_element);
    }    

}