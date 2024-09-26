// Import the pipeline function and env from transformers
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js';

// Disable local model checking
env.allowLocalModels = false;

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


$(document).ready(async function() {
    //console.log("ready");
    generate_triage_helper_table_rows();
    instantiate_media_player();
    handle_url_switcher();

    const qa_data_response = await fetch("data/qa_data.json");
    const qa_data = await qa_data_response.json();
    
    // render JSON using jsonViewer
    //$("#qa-data-json-viewer").jsonViewer(qa_data, {collapsed: false, rootCollapsable: true, withQuotes: false, withLinks: true});

    $("#qa-data-json-viewer").html(`<code class="json">${JSON.stringify(qa_data, null, 2)}</code>`);

    // apply highlight.js to each code block within the jsonViewer
    // $('#qa-data-json-viewer').each(function(i, block) {
    //     hljs.highlightElement(block);
    // });

  //   // apply highlight.js to each code block within the jsonViewer
  //   $('#qa-data-json-viewer .json-viewer').each(function(i, block) {
  //     $(block).find('pre code').each(function(j, codeBlock) {
  //         hljs.highlightElement(codeBlock);
  //     });
  // });    

hljs.highlightAll();

});

// function to handle URL switcher
function handle_url_switcher() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');

    if (tab) {
        const tab_index = {
            'post_helper': 0,
            'known_issues': 1,
            'upcoming_features': 2,
            'docs': 3,
            'qa': 4,
            'qa_data': 5,
            'videos': 6,
            'ui_explorer': 7,
            'glossary': 8
        }[tab];

        if (tab_index !== undefined) {
            UIkit.switcher('.uk-tab').show(tab_index);
        }
    }
}

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

/* AI Stuff */

let model;
let qa_data;

// Use a promise to ensure qa_data is loaded
let qa_data_loaded = new Promise((resolve, reject) => {
  $.getJSON('data/qa_data_with_embeddings.json', function(data) {
    qa_data = data.qa_data;
    for (const item of qa_data) {
      $("#question-list").append(`<li class="question-list-item">${item.question}</li>`);
    }
    resolve();
  });
});

await qa_data_loaded; // Ensure data is loaded

// function to load the model
async function load_model() {
  if (!model) {
    model = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
  }
}

// function to compute cosine similarity
function cosine_similarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    return 0; // Avoid division by zero
  } else {
    return dotProduct / denominator;
  }
}

// function to handle the user's query
async function handle_query(query) {
  await load_model();

  // generate embedding for the user's query
  const output = await model(query);

  // extract the embeddings from the tensor
  const [batch_size, num_tokens, embedding_dim] = output.dims;
  const token_embeddings = [];

  for (let i = 0; i < num_tokens; i++) {
    const start = i * embedding_dim;
    const end = start + embedding_dim;
    const embedding = output.data.slice(start, end);
    token_embeddings.push(Array.from(embedding));
  }

  // compute sentence embedding by averaging token embeddings
  const query_vector = mean_pooling(token_embeddings);

  console.log('query vector:', query_vector.length);

  const results = [];

  // compare embeddings to find the best matches
  for (const item of qa_data) {
    console.log('item embedding:', item.embedding.length);

    const score = cosine_similarity(query_vector, item.embedding);

    console.log(`similarity with "${item.question}": ${score}`);

    if (score > 0.5) {
      results.push({ item, score });
    }
  }

  // sort results by score in descending order and take the top 5
  results.sort((a, b) => b.score - a.score);
  const top_results = results.slice(0, 5);

  // display the top results
  if (top_results.length > 0) {
    display_answers(top_results, top_results.length);
  } else {
    $('#answer-steps').text('No relevant answers found.');
  }
}

// function to display the answers
function display_answers(results, result_count) {
  $('#answer-container').empty();

  results.forEach(({ item, score }) => {
    const item_copy = { ...item };
    delete item_copy.embedding;
    item_copy.confidence_score = score;

    let answer_steps_html = '';
    let related_links_html = '';

    item_copy.answer_steps.forEach((answer_paragraph) => {
      answer_steps_html += `<p class="orangetree">${answer_paragraph}</p>`;
    });

    item_copy.related_links.forEach((link) => {
      related_links_html += `<p class="appletree"><a href="${link}" target="_blank">${link}</a></p>`;
    });

    const answer_item_html = `
      <div class="answer">
        <div class="answer_property" uk-grid>
          <div class="answer_property_label">
            <p class="lemontree">Question</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${item_copy.question}</p>
          </div>
        </div>
        <div class="answer_property">
          <div class="full_width_answer_title">
            <p class="lemontree">Answer</p>
          </div>
          <div class="full_width_answer_content">
            ${answer_steps_html}
          </div>
        </div>
        <div class="answer_property" uk-grid>
          <div class="answer_property_label">
            <p class="lemontree">Category</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${item_copy.category}</p>
          </div>
        </div>
        <div class="answer_property" uk-grid>
          <div class="answer_property_label">
            <p class="lemontree">Interface</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${item_copy.interface}</p>
          </div>
        </div>
        <div class="answer_property" uk-grid>
          <div class="answer_property_label">
            <p class="lemontree">Related Links</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            ${related_links_html}
          </div>
        </div>
        <div class="answer_property" uk-grid>
          <div class="answer_property_label">
            <p class="lemontree">Cosine Similarity</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${score}</p>
          </div>
        </div>
        <div class="answer_property" uk-grid>
          <div class="answer_property_label">
            <p class="lemontree">ID</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${item_copy.id}</p>
          </div>
        </div>
        <div class="answer_property" uk-grid>
          <div class="answer_property_label">
            <p class="lemontree">Last Updated</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${item_copy.last_updated}</p>
          </div>
        </div>
      </div>
    `;

    $('#answer-container').append(answer_item_html);
    $('#qa_answers_result_count').text(`${result_count}`);
  });
}

// function to compute mean pooling of embeddings
function mean_pooling(tokenEmbeddings) {
  const numTokens = tokenEmbeddings.length;
  const embeddingDim = tokenEmbeddings[0].length;
  const sentenceEmbedding = [];

  for (let dim = 0; dim < embeddingDim; dim++) {
    let sum = 0;
    for (let token = 0; token < numTokens; token++) {
      sum += tokenEmbeddings[token][dim];
    }
    sentenceEmbedding.push(sum / numTokens);
  }

  return sentenceEmbedding;
}

// event listener for the query form
$(document).on('click', '#button_query_qa', async (event) => {
  event.preventDefault();
  const query = $('#query-input').val().trim();
  if (query) {
    //$('#answer-container').text('Loading...');
    // await qa_data_loaded; // Ensure data is loaded
    await handle_query(query);
  } else {
    $('#answer-steps').text('Please enter a question.');
  }
});


$(document).on('click', '.test-search-term', (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const search_term = $this.data('search-term');
  $('#query-input').val(search_term);
  $('#button_query_qa').click();
});


$(document).on('click', '.question-list-item', (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const search_term = $this.text();
  const $query_input = $('#query-input');
  $query_input.css({
    'background-color': '#c1ffc1',
    'color': '#000'
  }).val(search_term);
  $('#button_query_qa').click();

  // reset transition before applying it again
  $query_input.css('transition', 'none');
  setTimeout(() => {
    $query_input.css('transition', 'background-color 2s ease, color 2s ease');
    $query_input.css({
      'background-color': '',
      'color': ''
    });
  }, 0);
});


  
  $(document).on('click', '.uk-tab li', function() {
    const tab_names = ['post_helper', 'known_issues', 'upcoming_features', 'docs', 'qa', 'qa_data', 'videos', 'ui_explorer', 'glossary'];
      const tab_index = $(this).index();
      const tab_name = tab_names[tab_index];
      if (tab_name) {
          const new_url = `${window.location.origin}${window.location.pathname}?tab=${tab_name}`;
          history.pushState(null, '', new_url);
          // clear answer container and query input
          $('#answer-container').empty();
          $('#query-input').val('');
          $('#qa_answers_result_count').html('&nbsp;');
      }
  });

  $(document).on('click', '.switcher-tab-link', function(event) {
    event.preventDefault();
    const $this = $(event.currentTarget);
    const tab_name = $this.data('switcher-tab-name');
    const tab_index = {
    'post_helper': 0,
    'known_issues': 1,
    'upcoming_features': 2,
    'docs': 3,
    'qa': 4,
    'qa_data': 5,
    'videos': 6,
    'ui_explorer': 7,
    'glossary': 8
    }[tab_name];

    if (tab_index !== undefined) {
          UIkit.switcher('.uk-tab').show(tab_index);
      }

      // update the url
      const new_url = `${window.location.origin}${window.location.pathname}?tab=${tab_name}`;
      history.pushState(null, '', new_url);

  });

$(document).on('click', '#how-does-qa-work', (e) => {
  e.preventDefault();
  
  const modal_html = `
  <div class="uk-modal-dialog uk-margin-auto-vertical">
  <button class="close-my-uikit-modal uk-modal-close-default" type="button" uk-close></button>
  <div class="uk-modal-body" uk-overflow-auto>
  
<p class="page-description"><a href="data/qa_data.json" target="_blank">qa_data.json</a> contains an array of question/answer pair objects.</p>
<p class="page-description"><a href="preprocessing/generate_embeddings.js" target="_blank">generate_embeddings.js</a> generates embeddings for the <code>question</code> property.</p>
<p class="page-description">The model used to generate the embeddings is <a href="https://huggingface.co/Xenova/all-mpnet-base-v2" target="_blank">Xenova/all-mpnet-base-v2</a>.</p>
<p class="page-description"><a href="data/qa_data_with_embeddings.json" target="_blank">qa_data_with_embeddings.json</a> is the output of<code>generate_embeddings.js</code>.</p>
  <p class="page-description">Clicking the <code>Search</code> button:</p>
  <ul>
      <li>Embeds the query using the same model as the question embeddings</li>
      <li>Performs a cosine similarity search on the <code>embeddings</code> property</li>
      <li>Returns the item with the highest cosine similarity score</li>
  </ul>
  <p class="page-description">This is a client-side search on <code>qa_data_with_embeddings.json</code>.</p>
  </div>
  </div>
  `;
  
  $('#my-modal-overflow-qa-info').html(modal_html);
  UIkit.modal("#my-modal-overflow-qa-info").show();


});


$(document).on('click', '#qa-data-json-viewer-copy-button', (e) => {
  e.preventDefault();
  const $json_viewer = $('#qa-data-json-viewer');
  const json_text = $json_viewer.text();
  navigator.clipboard.writeText(json_text);
  UIkit.notification("JSON was copied to clipboard!", {status: 'success', timeout: 5000})
});

