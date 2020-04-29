// It's called "content script"

let companiesCafef = [];
chrome.runtime.sendMessage({PREPARE_START: true}, function(response) {
    eval(response.cafefCompaniesInfo); // Execute string as Javascript code. It declare a "oc" variable
    companiesCafef = oc || [];
});

const priceShowTitle = 'Hiện giá mong muốn';
const priceHideTitle = 'Ẩn giá mong muốn';

const btnExpectPriceId = 'btn-expect-price'
const btnExpectPriceNode = `
                           <a id=${btnExpectPriceId} class="cursor-point" style="position: fixed; z-index: 99999; top: 2px; right: 609px; color: rgb(255, 255, 255); font-size: 12px; padding: 6px;">
                                <i class="fa fa-eye" aria-hidden="true" style="margin-right: 3px"></i>
                                <span>${priceShowTitle}</span>
                           </a>
                          `;

const rightMenuExtendId = 'right-menu-extend';
const rightMenuExtendNode = `
                    <div id=${rightMenuExtendId} class="v-hide" style="color: rgb(255, 255, 255); font-size: 12px;">
                        <div class="v-header">
                            Định giá cổ phiếu
                        </div>
                        <div class="v-body">
                            <div style="text-align: right"><p id="remove-storage" class="cursor-point" style="display: inline-block; margin: 9px 6px">Xóa toàn bộ</p></div>
                            <form id="form-add">
                                  <div class="code">
                                     <input id="input-stock-code" name="stock_code" placeholder="Mã CK" type="text" style="width: 100%; border: none; ">
                                  </div>
                                  <div class="price">
                                     <input id="input-stock-price" name="stock_price" placeholder="Giá" type="text" style="width: 100%">
                                  </div>
                                   <div class="quantity">
                                     <input id="input-stock-quantity" name="stock_quantity" placeholder="Số lượng" type="text" style="width: 100%">
                                   </div>
                                  <div class="actions">
                                      <i id="submit-btn" data-target="form-add" class="fa fa-plus cursor-point" style="padding: 3px"></i>
                                  </div>
                            </form>
                            
                            <div id="expect-price-list"></div>
                            
                            <p>Ấn giữ và kéo mã chứng khoán để sắp xếp thứ tự ưu tiên</p>
                        </div>
                    </div>
                  `;

const ssiBody = $(document.body);

/**
 * Save data to chrome extension store. It's different with Local Storage you see in Chrome Dev Tool
 *
 * @param {Array.<Object>} data
 * @returns {Promise<unknown>}
 */
let setExpectPriceToStorage = function(data) {
    return new Promise(function (resolve) {
        chrome.storage.sync.set({"expectPriceData": data}, function() {
            resolve(data);
        });
    })
}

/**
 * Get value from storage
 * @returns {Promise<unknown>}
 */
let getExpectPriceFromStorage = function() {
    return new Promise(function (resolve) {
        chrome.storage.sync.get(['expectPriceData'], function(result) {
            resolve(result.expectPriceData);
        });
    })
}

// Clear storage
let removeStorage = function(name) {
    let isConfirm = confirm('Xóa toàn bộ mã chứng khoán đang theo dõi?')
    if (isConfirm) {
        chrome.storage.sync.remove('expectPriceData', function () {
            $("#expect-price-list").empty();
        });
    }
}

/**
 * This function is trigger when "plus" button clicked
 * @param e
 */
let addClicked = function (e) {
    let formId = this.dataset.target;
    let formEl = document.getElementById(formId);
    let stockCode = formEl.elements['stock_code'].value;
    let stockPrice = formEl.elements['stock_price'].value;
    let stockQuantity = formEl.elements['stock_quantity'].value || "";
    if (stockCode && stockPrice) {
        let newRecord = {
            stock_code: stockCode.trim().toUpperCase(),
            stock_price: stockPrice.trim().toUpperCase(),
            stock_quantity: stockQuantity.trim().toUpperCase()
        };

        getExpectPriceFromStorage().then(function (oldData) {
            if(oldData) {
                let isExist = oldData.filter(function (obj) {
                    return obj.stock_code === newRecord.stock_code;
                }).length;
                if (!isExist) {
                    oldData.push(newRecord);
                    setExpectPriceToStorage(oldData).then(function (result) {
                        appendEl(result);
                        formEl.elements['stock_code'].value = "";
                        formEl.elements['stock_price'].value = "";
                        formEl.elements['stock_quantity'].value = "";
                        document.getElementById('input-stock-code').focus();
                    })
                }
            } else {
                setExpectPriceToStorage([newRecord]).then(function (result) {
                    appendEl(result);
                    formEl.elements['stock_code'].value = "";
                    formEl.elements['stock_price'].value = "";
                    formEl.elements['stock_quantity'].value = "";
                    document.getElementById('input-stock-code').focus();
                })
            }
        })
    }
}

/**
 * This function is trigger when "minus" button clicked
 * @param e
 */
let removeClicked = function (e) {
    let idRemove = this.dataset.id;
    let isConfirm = confirm(`Xóa ${idRemove} khỏi danh sách theo dõi hiện tại?`)
    if (isConfirm) {
        getExpectPriceFromStorage().then(function (data) {
            if (data) {
                data = data.filter(function(item) {
                    return item.stock_code !== idRemove;
                })

                setExpectPriceToStorage(data).then(function (result) {
                    appendEl(result);
                })
            }
        })
    }
}

let isSortable = false;
/**
 * Remove all DOM element and add new data to DOM
 * @param {Array.<Object>} data
 */
let appendEl = function(data) {
    let parentEl = $("#expect-price-list");
    parentEl.empty(); // Remove old child element

    data.map(function (obj, key) {
        let companyName = GetCompanyName(companiesCafef, obj.stock_code);
        let cafefLink = "https://s.cafef.vn" + GetCompanyInfoLink(companiesCafef, obj.stock_code);
        let node = `<div class="wrap-stock-record" id="stock-${obj.stock_code}" >
                        <p style="margin-bottom: 5px; margin-top: 0; color: rgba(234, 234, 234, 0.5); text-align: center">${companyName? companyName : "Cafef sẽ tự động cập nhật khi có dữ liệu."}</p>
                        
                        <div class="stock-record">
                            <div class="stock-code">
                                <a class="cursor-point" id=${obj.stock_code}>
                                    <span class="has-symbol">${obj.stock_code}</span>
                                </a>
                            </div>
                            <div class="stock-expect-price text-overflow-ellipsis">${obj.stock_price}</div>
                            <div class="stock-quantity text-overflow-ellipsis">${obj.stock_quantity}</div>
                            <div class="stock-row-option">
                                <div class="link-to-page h-100">
                                    <a href=${cafefLink} title="${companyName}" target="_blank">
                                        <img src=${chrome.extension.getURL('icons/cafef-icon.png')} alt="" class="icon">
                                    </a>
                                </div>
                                <i data-id="${obj.stock_code}" class="fa fa-minus cursor-point v-remove-row"></i>
                            </div>
                        </div>
                     </div>`;

        parentEl.append(node);
    });

    for (let el of document.getElementsByClassName('v-remove-row')) {
        el.addEventListener('click', removeClicked);
    }

    // Check duplicate sortable before set
    if (isSortable) {
        parentEl.sortable('destroy');
        parentEl.sortable();
    } else {
        parentEl.sortable();
        isSortable = true;
    }
    // ===

    // Invoke when sortable has finished and DOM is updated
    parentEl.on( "sortupdate", function( event, ui ) {
        let sorted = parentEl.sortable( "serialize" );

        let newOrderArrStr = sorted.split("&").map(function (value) {
            // Child element has id pattern is "stock-stock_code" changed by "serialize" to string "stock[]=stock_code"
            return value.replace('stock[]=','').toUpperCase();
        })

        getExpectPriceFromStorage().then(function (oldOrderArrObj) {
            // Reorder stock list
            let newOrder = [];
            newOrderArrStr.map(function (stockCode) {
                let obj = oldOrderArrObj.find(obj => obj.stock_code.toUpperCase() === stockCode.toUpperCase())
                newOrder.push(obj);
            });
            setExpectPriceToStorage(newOrder);
        })

    } );
}

let enterKeyPress = function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById('submit-btn').click();
    }
}

/**
 * When plugin start run, this code below will be trigger.
 */
$(document).ready(function () {
    console.log("%c Viet27th@gmail.com. Contact me if you have any questions or ideas", 'background: #222; color: #bada55')
    let priceIsShow = false;
    let rightMenuExtendEl;

    // Add button to body
    ssiBody.prepend(btnExpectPriceNode);
    // End

    // Add right menu
    $(document.body).append(rightMenuExtendNode);
    rightMenuExtendEl = document.getElementById(rightMenuExtendId);
    document.getElementById('submit-btn').addEventListener('click', addClicked);
    document.getElementById('remove-storage').addEventListener('click', removeStorage);

    document.getElementById('input-stock-code').addEventListener("keyup", enterKeyPress);
    document.getElementById('input-stock-price').addEventListener("keyup", enterKeyPress);
    document.getElementById('input-stock-quantity').addEventListener("keyup", enterKeyPress);
    // End

    // Add click event to 
    $(`#${btnExpectPriceId}`).on('click', function (e) {
        if(priceIsShow) {
            priceIsShow = !priceIsShow;
            $(`#${btnExpectPriceId} span`).text(priceShowTitle);

            // Hide right menu
            rightMenuExtendEl.classList.remove('v-show');
            rightMenuExtendEl.classList.add('v-hide');

        } else {
            priceIsShow = !priceIsShow;
            $(`#${btnExpectPriceId} span`).text(priceHideTitle);

            // Show right menu
            rightMenuExtendEl.classList.remove('v-hide');
            rightMenuExtendEl.classList.add('v-show');
        }

    });

    getExpectPriceFromStorage().then(function(data) {
        if (data) {
            appendEl(data);
        }
    });

})




