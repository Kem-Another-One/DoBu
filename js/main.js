/* DoBu Martial Arts - simple website JavaScript */

// Set current year in the footer.
document.querySelectorAll('.current-year').forEach(function(item){
    item.textContent = new Date().getFullYear();
});

// Bootstrap-style form validation.
document.querySelectorAll('.needs-validation').forEach(function(form){
    form.addEventListener('submit', function(event){
        if(!form.checkValidity()){
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    });
});

// Contact form demo.
const contactForm = document.getElementById('contactForm');
if(contactForm){
    contactForm.addEventListener('submit', function(event){
        event.preventDefault();
        if(!contactForm.checkValidity()) return;
        const box = document.getElementById('contactMessage');
        box.classList.remove('d-none');
        box.textContent = 'Thank you. Your message has been recorded successfully.';
        contactForm.reset();
        contactForm.classList.remove('was-validated');
    });
}

// Registration and login using browser storage for this website.
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const membershipForm = document.getElementById('membershipForm');
const accountPanel = document.getElementById('accountPanel');
const accountText = document.getElementById('accountText');
const authPrompt = document.getElementById('authPrompt');

function getUser(){
    try{return JSON.parse(localStorage.getItem('dobuUser'));}
    catch(e){return null;}
}
function showAccount(){
    const user = getUser();
    if(!accountPanel || !accountText) return;
    if(user && sessionStorage.getItem('dobuLoggedIn') === 'yes'){
        accountPanel.classList.remove('d-none');
        if(authPrompt) authPrompt.classList.add('d-none');
        accountText.textContent = 'Signed in as ' + user.name + '. Choose or update your training package below.';
        document.getElementById('memberName').textContent = user.name;
        document.getElementById('memberEmail').textContent = user.email;
        document.getElementById('memberPlan').textContent = user.membership || 'Not selected yet';
    }else{
        accountPanel.classList.add('d-none');
        if(authPrompt) authPrompt.classList.remove('d-none');
    }
}

if(registerForm){
    registerForm.addEventListener('submit', function(event){
        event.preventDefault();
        if(!registerForm.checkValidity()) return;
        const password = document.getElementById('registerPassword').value;
        const user = {
            name: document.getElementById('registerName').value.trim(),
            email: document.getElementById('registerEmail').value.trim().toLowerCase(),
            password: password,
            membership: ''
        };
        localStorage.setItem('dobuUser', JSON.stringify(user));
        sessionStorage.removeItem('dobuLoggedIn');
        document.getElementById('registerMessage').innerHTML = 'Account created successfully. <a href="login.html" class="alert-link">Sign in to continue</a>.';
        document.getElementById('registerMessage').classList.remove('d-none');
        registerForm.reset();
        registerForm.classList.remove('was-validated');
        showAccount();
    });
}

if(loginForm){
    loginForm.addEventListener('submit', function(event){
        event.preventDefault();
        if(!loginForm.checkValidity()) return;
        const user = getUser();
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        const msg = document.getElementById('loginMessage');
        if(user && user.email === email && user.password === password){
            sessionStorage.setItem('dobuLoggedIn','yes');
            msg.className='alert alert-success';
            msg.textContent='Login successful. Opening your account...';
            window.location.href='account.html';
        }else{
            msg.className='alert alert-danger';
            msg.textContent='Email or password is not correct.';
        }
        msg.classList.remove('d-none');
    });
}

if(membershipForm){
    const packagePrices = {Basic:25, Intermediate:35, Advanced:45, Elite:60, Junior:25, None:0};
    const packageSelect = document.getElementById('membershipSelect');
    const extraOptions = document.querySelectorAll('.extra-option');
    const quantityInputs = document.querySelectorAll('.extra-quantity');
    function money(amount){return '£' + amount.toFixed(2);}
    function updatePrice(){
        let extras=0;
        extraOptions.forEach(function(option){
            const qtyInput=document.querySelector('.extra-quantity[data-for="'+option.id+'"]');
            if(option.checked){extras += Number(option.value) * (qtyInput ? Math.max(1,Number(qtyInput.value)||1) : 1);}
        });
        const monthly=packagePrices[packageSelect.value] || 0;
        document.getElementById('packagePrice').textContent=money(monthly) + (monthly ? ' / month' : '');
        document.getElementById('extrasPrice').textContent=money(extras);
        document.getElementById('totalPrice').textContent=money(monthly+extras);
    }
    extraOptions.forEach(function(option){
        option.addEventListener('change',function(){
            const qty=document.querySelector('.extra-quantity[data-for="'+option.id+'"]');
            if(qty) qty.disabled=!option.checked;
            updatePrice();
        });
    });
    quantityInputs.forEach(function(input){input.addEventListener('input',updatePrice);});
    packageSelect.addEventListener('change',updatePrice);
    updatePrice();
    membershipForm.addEventListener('submit', function(event){
        event.preventDefault();
        if(!membershipForm.checkValidity()){
            membershipForm.classList.add('was-validated');
            return;
        }
        const user = getUser();
        if(!user || sessionStorage.getItem('dobuLoggedIn') !== 'yes') return;
        const selectedPackage=packageSelect.value;
        const chosenExtras=[];
        let extrasTotal=0;
        extraOptions.forEach(function(option){
            if(option.checked){
                const qtyInput=document.querySelector('.extra-quantity[data-for="'+option.id+'"]');
                const quantity=qtyInput ? Math.max(1,Number(qtyInput.value)||1) : 1;
                const price=Number(option.value)*quantity;
                chosenExtras.push({name:option.dataset.name,quantity:quantity,price:price});
                extrasTotal+=price;
            }
        });
        const monthlyPrice=packagePrices[selectedPackage] || 0;
        const payment=document.querySelector('input[name="paymentMethod"]:checked').value;
        user.membership = selectedPackage === 'None' ? 'No monthly membership' : selectedPackage + ' (£' + monthlyPrice + '/month)';
        user.booking={package:selectedPackage,monthlyPrice:monthlyPrice,extras:chosenExtras,extrasTotal:extrasTotal,totalDue:monthlyPrice+extrasTotal,payment:payment,date:new Date().toLocaleDateString()};
        localStorage.setItem('dobuUser', JSON.stringify(user));
        membershipForm.classList.remove('was-validated');
        showAccount();
        const msg = document.getElementById('membershipMessage');
        const extrasText=chosenExtras.length ? chosenExtras.map(function(item){return item.name+(item.quantity>1?' × '+item.quantity:'')+' (£'+item.price.toFixed(2)+')';}).join(', ') : 'No extra sessions';
        msg.innerHTML='Booking confirmed for <strong>'+escapeText(user.name)+'</strong>.<br>Package: '+escapeText(user.membership)+'.<br>Extras: '+escapeText(extrasText)+'.<br>Due today: <strong>£'+(monthlyPrice+extrasTotal).toFixed(2)+'</strong> ('+escapeText(payment)+').<br><small>Demo booking only. Please arrange payment at reception or with DoBu staff.</small>';
        msg.classList.remove('d-none');
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
    logoutBtn.addEventListener('click', function(){
        sessionStorage.removeItem('dobuLoggedIn');
        showAccount();
        window.scrollTo({top:0,behavior:'smooth'});
    });
}
showAccount();

// Small community board for members.
const communityForm = document.getElementById('communityForm');
const communityList = document.getElementById('communityList');
function escapeText(value){
    const div=document.createElement('div');
    div.textContent=value;
    return div.innerHTML;
}
function loadPosts(){
    if(!communityList) return;
    let posts=[];
    try{posts=JSON.parse(localStorage.getItem('dobuPosts')) || [];}catch(e){posts=[];}
    if(posts.length===0){
        communityList.innerHTML='<p class="text-muted">No community posts yet.</p>';
        return;
    }
    communityList.innerHTML=posts.slice().reverse().map(function(p){
        return '<div class="community-post"><strong>'+escapeText(p.name)+'</strong><p class="mb-1">'+escapeText(p.message)+'</p><small class="text-muted">'+escapeText(p.date)+'</small></div>';
    }).join('');
}
if(communityForm){
    communityForm.addEventListener('submit', function(event){
        event.preventDefault();
        if(!communityForm.checkValidity()){
            communityForm.classList.add('was-validated');
            return;
        }
        const user=getUser();
        if(!user || sessionStorage.getItem('dobuLoggedIn')!=='yes') return;
        let posts=[];
        try{posts=JSON.parse(localStorage.getItem('dobuPosts')) || [];}catch(e){posts=[];}
        posts.push({name:user.name,message:document.getElementById('communityMessage').value.trim(),date:new Date().toLocaleDateString()});
        localStorage.setItem('dobuPosts',JSON.stringify(posts));
        communityForm.reset();
        communityForm.classList.remove('was-validated');
        loadPosts();
    });
}
loadPosts();
