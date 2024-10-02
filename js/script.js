// Import the pipeline function and env from transformers
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js';

import { format } from 'https://cdn.jsdelivr.net/npm/date-fns@2.28.0/esm/index.js';

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
    }).get().join(',\n') || "Not Provided";

    const select_language_model_options_text = $("#select-language-model-options option:selected").map(function() {
        return $(this).text();
    }).get().join(',\n') || "Not Provided";

    const select_symbols_options_text = $("#select-symbols-options option:selected").map(function() {
        return $(this).text();
    }).get().join(',\n') || "Not Provided";

    const select_submission_options_text = $("#select-submission-options option:selected").map(function() {
        return $(this).text();
    }).get().join(',\n') || "Not Provided";


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
    load_playlist(selected_playlist);
});


$(document).ready(async function() {
    generate_triage_helper_table_rows();
    instantiate_media_player();
    handle_url_switcher();

    const qa_data_response = await fetch("data/qa_data.json");
    const qa_data = await qa_data_response.json();
    
    // escape HTML characters in JSON data using he library
    const escaped_json = he.encode(JSON.stringify(qa_data, null, 2));

    // render JSON using jsonViewer
    //$("#qa-data-json-viewer").jsonViewer(qa_data, {collapsed: false, rootCollapsable: true, withQuotes: false, withLinks: true});

    $("#qa-data-json-viewer").html(`<code class="json">${escaped_json}</code>`);

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
            'status': 2,
            'upcoming_features': 3,
            'docs': 4,  
            'qa': 5,
            'qa_data': 6,
            'videos': 7,
            'ui_explorer': 8,
            'glossary': 9,
            'user_testing': 10
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

        const $table = $("#triage-helper-table"); // select the table
        const $table_body = $table.find("tbody"); // select the table body

        data.forEach(item => {
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

// function to fetch qa_data
async function load_qa_data() {
  const response = await fetch('data/qa_data_with_embeddings.json');
  const data = await response.json();
  qa_data = data.qa_data;

  // call the functions to process and display the data sequentially
  await load_qa_data_to_questions_list(qa_data);
  await load_qa_data_to_glossary(qa_data);
}

// function to list all questions alphabetically
async function load_qa_data_to_questions_list(qa_data) {
  // sort qa_data by question
  qa_data.sort((a, b) => a.question.localeCompare(b.question));

  // render the sorted questions
  for (const item of qa_data) {
    $("#question-list").append(`<li class="question-list-item">${item.question}</li>`);
  }

  // modify placeholder text for the query-input and question-search inputs to display the number of questions in the qa_data file 
  const number_of_questions = qa_data.length;
  $('#query-input').attr('placeholder', `Search ${number_of_questions} embedded questions...`);
  $('#question-search').attr('placeholder', `Filter ${number_of_questions} questions - click item to add to search...`);
}

// function to list glossary items grouped by category and sorted alphabetically
async function load_qa_data_to_glossary(qa_data) {
  // filter and group by glossary_category
  const glossary_items = qa_data.filter(item => item.category === "Glossary");
  const grouped_data = glossary_items.reduce((acc, item) => {
    if (!acc[item.glossary_category]) {
      acc[item.glossary_category] = [];
    }
    acc[item.glossary_category].push(item);
    return acc;
  }, {});

  // sort the categories using the default sorting function
  const sorted_categories = Object.keys(grouped_data).sort((a, b) => a.localeCompare(b));

  // sort each group by glossary_term
  for (const category of sorted_categories) {
    grouped_data[category].sort((a, b) => a.glossary_term.localeCompare(b.glossary_term));
  }

  // render the grouped and sorted glossary items
  for (const category of sorted_categories) {
    $("#glossary-terms-container").append(`<p class="glossary-section-header">${category}</p>`);
    for (const item of grouped_data[category]) {
      let answer_steps_html = '';
      item.answer_steps.forEach((answer_paragraph, index) => {
        if (index === 0) {
          answer_steps_html += `<p class="glossary_answer"><span class="glossary_a">A:</span>${answer_paragraph}</p>`;
        } else {
          answer_steps_html += `<p class="glossary_answer">${answer_paragraph}</p>`;
        }
      });

      $("#glossary-terms-container").append(`
        <p class="glossary_term" uk-toggle="target: +.glossary_term_container">
          <span class="glossary_toggle" uk-icon="icon: plus; ratio: 1"></span> <span class="glossary_term_text">${item.glossary_term}</span>
        </p>
        <div class="glossary_term_container" hidden>
          <p class="glossary_question"><span class="glossary_q">Q:</span>${item.question}</p>
          ${answer_steps_html}
        </div>
      `);
    }
  }

// add glossary term count to glossary-term-filter-input placeholder text
$('#glossary-term-filter-input').attr('placeholder', `Filter ${glossary_items.length} glossary terms...`);

}

// call the function to load data
await load_qa_data();
// open the first glossary term - dodgy mcdodge
// $('.glossary_term').first().click();


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

// function to preprocess text
// function preprocess_text(text) {
//   return text
//     .replace(/<\/?code>/g, '') // remove <code> tags
//     .replace(/[^a-zA-Z0-9\s]/g, '') // remove special characters
//     .toLowerCase() // convert to lowercase
//     .replace(/\s+/g, ' '); // replace multiple spaces with a single space
// }

function preprocess_text(text) {
  return text
    .replace(/<\/?code>/g, '') // remove <code> tags
    .toLowerCase() // convert to lowercase
}

// function to handle the user's query
async function handle_query(query) {
  await load_model();

  // remove special characters and convert query to lowercase
  const cleaned_query = preprocess_text(query);

  // generate embedding for the user's query
  const output = await model(cleaned_query);

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

  console.log('query vector length:', query_vector.length);

  const results = [];

  // compare embeddings to find the best matches
  for (const item of qa_data) {
    console.log('item embedding length:', item.embedding.length);

    const score = cosine_similarity(query_vector, item.embedding);

    const cleaned_question = preprocess_text(item.question);

    console.log(`similarity with "${cleaned_question}": ${score}`);

    if (score > 0.4) {
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
    $('#loading_indicator').hide();
    // clear the answer container
    $('#answer-container').empty();
    // show result count
    $('#qa_answers_result_count').text('0');
    // show no results message
    UIkit.notification('No relevant answers found.', {status: 'warning', timeout: 5000});
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
          <div class="answer_property_value uk-width-expand qa_question">
            <p class="appletree">${item_copy.question}</p>
          </div>
        </div>
        <div class="answer_property">
          <div class="full_width_answer_title">
            <p class="lemontree">Answer</p>
          </div>
          <div class="full_width_answer_content qa_answer">
            ${answer_steps_html}
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
            <p class="lemontree">Category</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${item_copy.category}</p>
          </div>
        </div>
        <div class="answer_property" uk-grid>
          <div class="answer_property_label">
            <p class="lemontree">Glossary Term</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${item_copy.glossary_term}</p>
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
            <p class="lemontree">Status</p>
          </div>
          <div class="answer_property_value uk-width-expand">
            <p class="appletree">${item_copy.status}</p>
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

    $('#loading_indicator').hide();
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
  $('#loading_indicator').show();
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
  $query_input.trigger('input');
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
    const tab_names = ['post_helper', 'known_issues', 'status', 'upcoming_features', 'docs', 'qa', 'qa_data', 'videos', 'ui_explorer', 'glossary', 'user_testing'];
      const tab_index = $(this).index();
      const tab_name = tab_names[tab_index];
      if (tab_name) {
          const new_url = `${window.location.origin}${window.location.pathname}?tab=${tab_name}`;
          history.pushState(null, '', new_url);
          // clear answer container and query input
          $('#answer-container').empty();
          $('#query-input').val('').trigger('input');
          $('#qa_answers_result_count').html('&nbsp;');
          // clear question search and glossary term search
          // need to trigger input event to clear the search icon 
          $('#question-search').val('').trigger('input');
          $('#glossary-term-filter-input').val('').trigger('input');
      }
  });

  $(document).on('click', '.switcher-tab-link', function(event) {
    event.preventDefault();
    const $this = $(event.currentTarget);
    const tab_name = $this.data('switcher-tab-name');
    const tab_index = {
    'post_helper': 0,
    'known_issues': 1,
    'status': 2,    
    'upcoming_features': 3,
    'docs': 4,
    'qa': 5,
    'qa_data': 6,
    'videos': 7,
    'ui_explorer': 8,
    'glossary': 9,
    'user_testing': 10
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
      <li>Returns the top five results with cosine similarity above 0.4</li>
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


$(document).on('click', '#open-qa-data-generate-modal', (e) => {
  e.preventDefault();

  const modal_html = `
  <div id="qa-data-generate-modal" class="uk-modal-dialog uk-margin-auto-vertical">
    <button class="uk-modal-close-outside" type="button" uk-close></button>
    <div class="uk-modal-body" uk-overflow-auto>
      <form id="qa-data-generate-form">
        <div class="uk-margin">
          <select class="uk-select" id="interface_qa" required>
            <option value="">select an interface</option>
            <option value="ctrl_k">Ctrl + K</option>
            <option value="ctrl_l">Ctrl + L</option>
            <option value="ctrl_i">Ctrl + I</option>
            <option value="not_applicable">Not Applicable</option>
          </select>
        </div>
        <div class="uk-margin">
          <select class="uk-select" id="category_qa" required>
            <option value="">select a category</option>
            <option value="bug">Bug</option>
            <option value="error">Error</option>
            <option value="general">General</option>
            <option value="glossary">Glossary</option>
          </select>
        </div>
        <div class="uk-margin">
          <input class="uk-input" type="text" id="question_qa" placeholder="Question" required>
        </div>
        <p class="generate-qa-header">Answer Steps</p>
        <div class="uk-margin">
          <div id="answer-steps-container" uk-sortable="handle: .uk-sortable-handle">
            <div class="answer-step-container uk-margin uk-grid-small" uk-grid>
              <div class="uk-width-auto">
                <span class="uk-sortable-handle uk-margin-small-right uk-text-center" uk-icon="icon: table"></span>
              </div>
              <div class="uk-width-expand">
                <input type="text" class="uk-input" placeholder="answer step" required>
              </div>
              <div class="uk-width-auto">
                <button class="uk-button uk-button-default remove-answer-step" type="button">Remove</button>
              </div>
            </div>
          </div>
          <button id="add-answer-step" class="uk-button uk-button-small">Add Step</button>
        </div>
        <p class="generate-qa-header">Related Links</p>
        <div class="uk-margin">
          <div id="related-links-container" uk-sortable="handle: .uk-sortable-handle">
            <div class="related-link-container uk-margin uk-grid-small" uk-grid>
              <div class="uk-width-auto">
                <span class="uk-sortable-handle uk-margin-small-right uk-text-center" uk-icon="icon: table"></span>
              </div>
              <div class="uk-width-expand">
                <input type="text" class="uk-input" placeholder="related link" required>
              </div>
              <div class="uk-width-auto">
                <button class="uk-button uk-button-default remove-related-link" type="button">Remove</button>
              </div>
            </div>
          </div>
          <button id="add-related-link" class="uk-button uk-button-small">Add Link</button>
        </div>
      </form>
    </div>
    <div class="uk-modal-footer uk-text-right">
      <button class="uk-button uk-button-secondary uk-width-1-1" id="qa-data-generate">Copy JSON to Clipboard</button>
    </div>
  </div>
  `;

  $('#my-modal-overflow-qa-generate-qa').html(modal_html);
  UIkit.modal("#my-modal-overflow-qa-generate-qa").show();
});

$(document).on('click', '#open-question_only-data-generate-modal', (e) => {
  e.preventDefault();

  const modal_html = `
  <div id="qa-data-generate-modal" class="uk-modal-dialog uk-margin-auto-vertical">
    <button class="uk-modal-close-outside" type="button" uk-close></button>
    <div class="uk-modal-body" uk-overflow-auto>
      <form id="question-only-data-generate-form">
        <div class="uk-margin">
          <select class="uk-select" id="interface" required>
            <option value="">select an interface</option>
            <option value="ctrl_k">Ctrl + K</option>
            <option value="ctrl_l">Ctrl + L</option>
            <option value="ctrl_i">Ctrl + I</option>
            <option value="not_applicable">Not Applicable</option>
          </select>
        </div>
        <div class="uk-margin">
          <select class="uk-select" id="category" required>
            <option value="">select a category</option>
            <option value="bug">Bug</option>
            <option value="error">Error</option>
            <option value="general">General</option>
            <option value="glossary">Glossary</option>
          </select>
        </div>
        <div class="uk-margin">
          <input class="uk-input" type="text" id="question" placeholder="Question" required>
        </div>
      </form>
    </div>
    <div class="uk-modal-footer uk-text-right">
      <button class="uk-button uk-button-secondary uk-width-1-1" id="question-only-data-generate">Copy JSON to Clipboard</button>
    </div>
  </div>
  `;

  $('#my-modal-overflow-qa-generate-qa').html(modal_html);
  UIkit.modal("#my-modal-overflow-qa-generate-qa").show();
});


$(document).on('click', '#add-answer-step', function() {

  const new_input_html = `
  <div class="answer-step-container uk-margin uk-grid-small" uk-grid>
  <div class="uk-width-auto">
    <span class="uk-sortable-handle uk-margin-small-right uk-text-center" uk-icon="icon: table"></span>
  </div>
  <div class="uk-width-expand">
    <input type="text" class="uk-input" placeholder="answer step" required>
  </div>
  <div class="uk-width-auto">
    <button class="uk-button uk-button-default remove-answer-step" type="button">Remove</button>
  </div>
</div>`;

  $('#answer-steps-container').append(new_input_html);

});


$(document).on('click', '#add-related-link', function() {

  const new_input_html = `
  <div class="related-link-container uk-margin uk-grid-small" uk-grid>
  <div class="uk-width-auto">
    <span class="uk-sortable-handle uk-margin-small-right uk-text-center" uk-icon="icon: table"></span>
  </div>
  <div class="uk-width-expand">
    <input type="text" class="uk-input" placeholder="related link" required>
  </div>
  <div class="uk-width-auto">
    <button class="uk-button uk-button-default remove-related-link" type="button">Remove</button>
  </div>
</div>`;

  $('#related-links-container').append(new_input_html);

});



$(document).on('click', '.remove-answer-step', function(event) {
  event.preventDefault();
  const $answer_step_container = $('.answer-step-container');
  if ($answer_step_container.length > 1) {
    $(this).closest('.answer-step-container').remove();
  } else {
    UIkit.notification("Cannot remove last answer step!", {status: 'warning', timeout: 3000});
  }
});


$(document).on('click', '.remove-related-link', function(event) {
  event.preventDefault();
  const $related_link_container = $('.related-link-container');
  
  if ($related_link_container.length > 1) {
    $(this).closest('.related-link-container').remove();
  } else {
    UIkit.notification("Cannot remove last related link!", {status: 'warning', timeout: 3000});
  }
});


$(document).on('click', '#qa-data-generate', function(event) {
  event.preventDefault();
  
  // run form validations
  const $form = $('#qa-data-generate-form');
  if (!$form[0].checkValidity()) {
    $form[0].reportValidity();
    return;
  }

  const id = "----increment-this-id-for-each-new-qa----";
  const interface_val = $('#interface_qa').val();
  const category = $('#category_qa option:selected').val();
  const question = $('#question_qa').val();
  const last_updated = format(new Date(), 'dd/MM/yy');

  const answer_steps = $('#answer-steps-container input').map(function() {
      return $(this).val();
  }).get();

  const related_links = $('#related-links-container input').map(function() {
      return $(this).val();
  }).get();

  const result = {
      id: id,
      interface: interface_val,
      category: category,
      question: question,
      answer_steps: answer_steps,
      related_links: related_links,
      last_updated: last_updated
  };

  navigator.clipboard.writeText(JSON.stringify(result, null, 2)).then(function() {
    UIkit.notification("Q&A was copied to clipboard!", {status: 'success', timeout: 5000})
  }).catch(function(err) {
    console.error('could not copy text: ', err);
  });
});


$(document).on('click', '#question-only-data-generate', function(event) {
  event.preventDefault();
  
  // run form validations
  const $form = $('#question-only-data-generate-form');
  if (!$form[0].checkValidity()) {
    $form[0].reportValidity();
    return;
  }

  const id = "----increment-this-id-for-each-new-qa----";
  const interface_val = $('#interface').val();
  const category = $('#category option:selected').val();
  const question = $('#question').val();
  const last_updated = format(new Date(), 'dd/MM/yy');

  const answer_steps = [];

  const related_links = [];

  const result = {
      id: id,
      interface: interface_val,
      category: category,
      question: question,
      answer_steps: answer_steps,
      related_links: related_links,
      last_updated: last_updated
  };

  navigator.clipboard.writeText(JSON.stringify(result, null, 2)).then(function() {
    UIkit.notification("Question was copied to clipboard!", {status: 'success', timeout: 5000})
  }).catch(function(err) {
    console.error('could not copy text: ', err);
  });
});


$(document).on('click', '.open-ui-explorer-gallery', (event) => {
  event.preventDefault();
  const $this = $(event.currentTarget);
  const index = $this.data('gallery-index');
  UIkit.lightbox('#ui_explorer_gallery').show(index);
});


$(document).on('click', '.glossary_term', function() {
  const $toggleIcon = $(this).find('.glossary_toggle');
  const $container = $(this).next('.glossary_term_container');

  // toggle the icon
  if ($container.is(':hidden')) {
    $toggleIcon.attr('uk-icon', 'icon: plus; ratio: 1');
  } else {
    $toggleIcon.attr('uk-icon', 'icon: minus; ratio: 1');
  }
});


$(document).on('input', '#glossary-term-filter-input', function() {
  const filter_text = $(this).val().toLowerCase();

  // show/hide the clear icon based on input length
  if (filter_text.length > 0) {
    $('#clear-glossary-term-search-icon').show();
  } else {
    $('#clear-glossary-term-search-icon').hide();
}

  $('#glossary-terms-container .glossary-section-header').each(function() {
      const $section_header = $(this);
      let has_matching_terms = false;

      $section_header.nextUntil('.glossary-section-header').each(function() {
          const $term = $(this);
          if ($term.hasClass('glossary_term')) {
              const term_text = $term.find('.glossary_term_text').text().toLowerCase();
              if (term_text.includes(filter_text)) {
                  $term.show();
                  has_matching_terms = true;
              } else {
                  $term.hide();
              }
          }
      });

      if (has_matching_terms) {
          $section_header.show();
      } else {
          $section_header.hide();
      }
  });
});

$(document).on('input', '#question-search', function() {
  const filter_text = $(this).val().toLowerCase();

  // show/hide the clear icon based on input length
  if (filter_text.length > 0) {
      $('#clear-question-search-icon').show();
  } else {
      $('#clear-question-search-icon').hide();
  }

  $('#question-list .question-list-item').each(function() {
      const $item = $(this);
      const item_text = $item.text().toLowerCase();
      if (item_text.includes(filter_text)) {
          $item.show();
      } else {
          $item.hide();
      }
  });
});


$(document).on('input', '#query-input', function() {
  const filter_text = $(this).val();

  // show/hide the clear icon based on input length
  if (filter_text.length > 0) {
      $('#clear-embedding-search-icon').show();
  } else {
      $('#clear-embedding-search-icon').hide();
  }

});


// add event handler to clear the input field when the icon is clicked
$(document).on('click', '#clear-question-search-icon', function() {
  $('#question-search').val('').trigger('input');
});

// add event handler to clear the input field when the icon is clicked
$(document).on('click', '#clear-glossary-term-search-icon', function() {
  $('#glossary-term-filter-input').val('').trigger('input');
});

// add event handler to clear the input field when the icon is clicked
$(document).on('click', '#clear-embedding-search-icon', function() {

    // clear answer container and query input
    $('#answer-container').empty();
    $('#query-input').val('').trigger('input');
    $('#qa_answers_result_count').html('&nbsp;');

});

