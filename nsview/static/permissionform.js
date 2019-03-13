$(document).ready(function () {

   var form = $('#permissionform')
      , email = $('#email')
      , message = $('#message')
      , info = $('#info')
      , submit = $("#submit");

   form.on('input', '#email, #message', function () {
      $(this).css('border-color', '');
      info.html('').slideUp();
   });

   submit.on('click', function (e) {
      e.preventDefault();
      if (validate()) {
         $.ajax({
            type: "POST"
            , url: "permissionrequest"
            , data: form.serialize()
            , dataType: "json"
         }).done(function (data) {
            if (data.success) {
               email.val('');
               message.val('');
               info.html('Message sent!').css('color', 'green').slideDown();
            } else {
               info.html('Could not send mail! Sorry!').css('color', 'red').slideDown();
            }
         });
      }
   });

   function validate () {
      var valid = true;
      var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (!regex.test(email.val())) {
         email.css('border-color', 'red');
         valid = false;
      }

      if ($.trim(message.val()) === "") {
         message.css('border-color', 'red');
         valid = false;
      }

      return valid;
   }

});
