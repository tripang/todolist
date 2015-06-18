function addTask(id) {
    $(".lists form").hide('1');
    $("#"+id+" form").show('1');
    $("#"+id+" input.task-name").focus();
}

function deleteTask(el, path) {
    $(el).parent().hide('1', function() {
        window.location.replace(path);
    });
}

function deleteList(id, path) {
    $("#"+id).hide('1', function() {
        window.location.replace(path);
    });
}