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
