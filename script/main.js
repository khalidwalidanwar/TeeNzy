function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const appendAlert = (message, type) => {
  clearTimeout(ztime);
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" onclick="document.getElementById(`liveAlertPlaceholder`).style.right = `-100%`;" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  alertPlaceholder.append(wrapper);
  alertPlaceholder.style.right = 0;
  var ztime = setTimeout(() => {
    wrapper.remove();
  }, 5000);
}

async function getUserData(userId) {
    try {
        // نرسل طلب GET مع تحديد المجموعة والـ ID
        const response = await fetch(`../../php/proxy.php?col=users&id=${userId}`);
        
        const result = await response.json();

        if (response.ok) {
            return result;
        } else {
            console.error("❌ فشل جلب البيانات:", result);
            alert("المستخدم غير موجود أو حدث خطأ في السيرفر");
        }
    } catch (error) {
        console.error("🌐 خطأ في الاتصال:", error);
    }
}
async function getProductData(productId) {
    try {
        // نرسل طلب GET مع تحديد المجموعة والـ ID
        const response = await fetch(`../../php/proxy.php?col=products&id=${productId}`);
        
        const result = await response.json();

        if (response.ok) {
            return result;
        } else {
            console.error("❌ فشل جلب البيانات:", result);
            alert("المستخدم غير موجود أو حدث خطأ في السيرفر");
        }
    } catch (error) {
        console.error("🌐 خطأ في الاتصال:", error);
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
        appendAlert("There is an error, Please try again later!","danger");
    }
}
async function updateOrder(orderId, updatedData) {
    try {
        const response = await fetch(`../../php/proxy.php?col=orders&id=${orderId}`, {
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
        appendAlert("There is an error, Please try again later!","danger");
    }
}
async function updateProduct(productId, updatedData) {
    try {
        const response = await fetch(`../../php/proxy.php?col=products&id=${productId}`, {
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
        appendAlert("There is an error, Please try again later!","danger");
    }
}
async function getOrderData(orderId) {
    try {
        // نرسل طلب GET مع تحديد المجموعة والـ ID
        const response = await fetch(`../../php/proxy.php?col=orders&id=${orderId}`);
        
        const result = await response.json();

        if (response.ok) {
            return result;
        } else {
            console.error("❌ فشل جلب البيانات:", result);
            alert("المستخدم غير موجود أو حدث خطأ في السيرفر");
        }
    } catch (error) {
        console.error("🌐 خطأ في الاتصال:", error);
    }
}
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
async function addOrder(order) {
    try {
        // نرسل الطلب إلى proxy.php مع تحديد المجموعة (col=users)
        const response = await fetch('../../php/proxy.php?col=orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("✅ تم إضافة الاوردر بنجاح:");
            return result;
        } else {
            console.error("❌ فشل الإضافة:");
        }
    } catch (error) {
        console.error("🌐 خطأ في الاتصال بالسيرفر:", error);
        appendAlert("There is an error, Please try again later!","danger");
    }
}


// const alertTrigger = document.getElementById('liveAlertBtn')
// if (alertTrigger) {
//   alertTrigger.addEventListener('click', () => {
//     appendAlert('Nice, you triggered this alert message!', 'danger')
//   })
// }
export {setCookie, getCookie, eraseCookie, appendAlert,getUserData,getProductData,getOrderData,updateOrder,addOrder,updateProduct,updateUser};