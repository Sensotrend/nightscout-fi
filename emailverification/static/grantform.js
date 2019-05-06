$(document).ready(function () {

   var form = $('#grantform')
      , info = $('#info')
      , check = $('#check')
      , submit = $("#submit")
      , success = $("#success");

   form.on('input', '#url, #secret', function () {
      $(this).css('border-color', '');
      info.html('').slideUp();
   });

   submit.on('click', function (e) {
      e.preventDefault();
      if (validate()) {
         $.ajax({
            type: "POST"
            , url: "/emailverification/verify"
            , data: form.serialize()
            , dataType: "json"
         }).done(function (data) {
            if (data.success) {
               form.hide();
               success.show();
            } else {
               info.html('Sähköpostin verifioinnissa oli ongelma, yritä myöhemmin uudelleen').css('color', 'red').slideDown();
            }
         });
      }
   });

   function validate () {
      var valid = true;

      if (!$('#check').is(':checked')) {
         check.css('border-color', 'red');
         valid = false;
      }

      return valid;
   }

});
