$(document).ready(function () {

   var form = $('#grantform')
      , nsurl = $('#nsurl')
      , secret = $('#secret')
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
            , url: "grantpermission"
            , data: form.serialize()
            , dataType: "json"
         }).done(function (data) {
            if (data.success) {
               form.hide();
               success.show();
//               email.val('');
//               message.val('');
//               info.html('Message sent!').css('color', 'green').slideDown();
            } else {
               info.html('There was a problem saving the grant').css('color', 'red').slideDown();
            }
         });
      }
   });

   function validate () {
      var valid = true;

      if ($.trim(nsurl.val()) === "") {
         nsurl.css('border-color', 'red');
         valid = false;
      }

      if ($.trim(secret.val()) === "") {
         secret.css('border-color', 'red');
         valid = false;
      }

      if ($.trim(check.val()) === "") {
         check.css('border-color', 'red');
         valid = false;
      }

      return valid;
   }

});
