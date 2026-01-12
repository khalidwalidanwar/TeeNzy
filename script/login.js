import {getCookie, setCookie, eraseCookie,appendAlert} from './main.js';
// import {app, db, collection, getDocs, addDoc, query,limit,where ,deleteDoc,doc,updateDoc,getDoc} from './app.js';

// fetch('../../php/proxy.php?col=users').then(res=>res.json()).then(((res)=>{
//     console.log(res)
// }))

// check if user is logged in
window.addEventListener('load', () => {
    document.querySelector("input#email").focus();
    const user = getCookie('userId');
    if(getCookie("emailToVirify")){
        window.location.href = './verify.html';
    }else if(user){
        window.location.href = '../../';
    }
});
// handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    event.target.querySelector('button').disabled = true;
    const email = document.getElementById('email').value;
    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)){
        appendAlert('Please enter a valid email address.',"danger");
        return;
    }
    // Simulate sending a verification code to the email
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCookie('emailToVirify', email, 15); // 15 minutes
    // Check if user already exists
    fetch('../../php/proxy.php?col=users').then(res=>res.json()).then((async(res)=>{
        let user = null;
        res.forEach(ofuser => {
            if(ofuser.email == email){
                user = ofuser;
            }
        });
        if(user){
            updateUser(user.id,{
                verificationCode: verificationCode,
                createdAt: new Date(),
                isVerified: false,
            }).then(()=>{
                const templateParams = {email: email,code: verificationCode,message: `${verificationCode} هو رمز التحقق الخاص بك لتسجيل الدخول إلى TNZY. هذا الرمز صالح لمدة 15 دقائق. إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`};
                emailjs.send('service_82g1fut', 'template_9yw7zah', templateParams)
                    .then((response) => {
                        setCookie('userId', user.id, 60*24*365); // 1 Year
                        appendAlert(`A verification code has been sent to ${email}. The code is valid for 15 minutes.`,"success");
                        setTimeout(() => {
                            window.location.href = './verify.html';
                        }, 5000);
                    }, (error) => {
                        appendAlert('Failed to send verification email. Please try again later.','warning');
                        console.log('FAILED...', error);
                    });
            });
            return;
        }else{
            addUser(email, verificationCode).then((docRef) => {
                // sendVerificationEmail(email, verificationCode);
                const templateParams = {email: email,code: verificationCode,message: `${verificationCode} هو رمز التحقق الخاص بك لتسجيل الدخول إلى TNZY. هذا الرمز صالح لمدة 15 دقائق. إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`};
                emailjs.send('service_82g1fut', 'template_9yw7zah', templateParams)
                    .then((response) => {
                        setCookie('userId', docRef.id, 60*24*365); // 1 Year
                        appendAlert(`A verification code has been sent to ${email}. The code is valid for 15 minutes.`,"success");
                        setTimeout(() => {
                            window.location.href = './verify.html';
                        }, 5000);
                    }, (error) => {
                        appendAlert('Failed to send verification email. Please try again later.','warning');
                        console.log('FAILED...', error);
                    });
            });
            
            return;
        }
    }))
});


async function addUser(email,code) {
    try {
        // نرسل الطلب إلى proxy.php مع تحديد المجموعة (col=users)
        const response = await fetch('../../php/proxy.php?col=users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                createdAt: new Date(),
                verificationCode:code,
                isVerified: false,
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ تم إضافة المستخدم بنجاح:");
            return result;
        } else {
            console.error("❌ فشل الإضافة:");
        }
    } catch (error) {
        console.error("🌐 خطأ في الاتصال بالسيرفر:", error);
        appendAlert("There is an error, Please try again later!");
    }
}


async function updateUser(userId, updatedData) {
    try {
        const response = await fetch(`../../php/proxy.php?col=users&id=${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ تم التعديل بنجاح:");
        } else {
            console.error("❌ فشل التعديل:", result);
        }
    } catch (error) {
        console.error("🌐 خطأ في الاتصال بالسيرفر:", error);
        appendAlert("There is an error, Please try again later!");
    }
}

