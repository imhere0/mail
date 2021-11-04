document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#send-email').addEventListener('click', send_email);
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#send-email').addEventListener('click', send_email);
}

function send_email() {
  
    const recipient = document.querySelector('#compose-recipients').value;
  
    const subject = document.querySelector('#compose-subject').value;
  
    const body = document.querySelector('#compose-body').value;


    fetch('/emails', {
    method : 'POST',
    body : JSON.stringify({
      recipients: recipient,
      subject : subject,
      body: body  
    })
    })

    .then(Response => Response.json())
    .then(emails => {
      load_mailbox('sent');
    })

   
  }

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (!localStorage.getItem('mailbackgroundcolor'))
  {
    localStorage.setItem('mailbackgroundcolor','white');
  }

  const mailvariable = `${mailbox}`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      const emaildiv =  document.querySelector('#emails-view');
      emails.forEach(element => {
        
        var mail = document.createElement("div");
    
        mail.style.width = '100%';
        mail.style.borderStyle = 'solid';
        mail.style.borderWidth = '0.1rem';
        mail.style.borderColor = 'black';
        mail.style.display = 'flex';

        mail.innerHTML =
        `<div id = "sender " style = "margin-right: 1.0rem"> ${element.sender.bold()}</div> 
        <div id = "subject"> ${element.subject}</div>
        <div id = "time" > ${element.timestamp}</div>
        `;

        let read = element["read"];
        if(!read)
          {
            mail.style.backgroundColor = 'white';
          }
          else{
            mail.style.backgroundColor = 'lightgrey';
          }
        
        emaildiv.append(mail);
        mail.addEventListener('click',function (){

          
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#single-email-view').style.display = 'block';

          fetch(`/emails/${element.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
          
  


          document.querySelector('#single-email-view').innerHTML = 
          `<div class = "From"><span> From:</span> ${element.sender}  </div>
          <div class = "To"><span> To:</span> ${element.recipients} </div>
          <div class = "Subject"><span> Subject:</span> ${element.subject}</div>
          <div class = "Timestamp"><span>TimeStamp:</span> ${element.timestamp}</div>
         

          <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
          <hr>
          <p> ${element.body} </p> `;

          if (mailvariable !== `sent`)
          {  
            let archiveness = element["archived"]; 
            if (!archiveness){
              document.querySelector('#single-email-view').innerHTML += 
              '<hr>'+
              '<button class="btn btn-sm btn-outline-primary" id="archive">Archive</button>';
              document.querySelector('#archive').addEventListener('click', function(){

                fetch(`/emails/${element.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: true
                  })
                })
  
                load_mailbox('inbox');
  
              })

            }
            else if (archiveness){
              document.querySelector('#single-email-view').innerHTML += 
              '<hr>'+
              '<button class="btn btn-sm btn-outline-primary" id="unarchive">Unarchive</button>';
              document.querySelector('#unarchive').addEventListener('click', function(){

                fetch(`/emails/${element.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                     archived: false
                  })
               })
                load_mailbox('inbox');
  
              })
            }
            
        
          }
          document.querySelector('#reply').addEventListener('click', function(){
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'block';
            document.querySelector('#single-email-view').style.display = 'none';


            document.querySelector('#compose-recipients').value = element["sender"];

            let checksubject = `${element.subject.charAt(0) + element.subject.charAt(1) + element.subject.charAt(2)}`;
            if (checksubject !== `Re:`)
            {
              document.querySelector('#compose-subject').value = `Re: ${element.subject}`;
            }
            else
            {
              document.querySelector('#compose-subject').value = ` ${element.subject}`; 
            }
           
            document.querySelector('#compose-body').value = `On ${element.timestamp}  ${element.sender} wrote:  ${element.body}`;

            document.querySelector('#send-email').addEventListener('click', send_email);



          })

        
        });
   

      });
       
  });

}


