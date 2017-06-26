(function(global) {
    var arrow = '<span class="context-top-arrow"></span><span class="context-bottom-arrow"></span>';

    MegaData.prototype.buildRootSubMenu = function() {

        var cs = '',
            sm = '',
            html = '';

        for (var h in this.c[this.RootID]) {
            if (this.d[h] && this.d[h].t) {
                cs = ' contains-submenu';
                sm = '<span class="dropdown body submenu" id="sm_' + this.RootID + '">'
                    + '<span id="csb_' + this.RootID + '"></span>' + arrow + '</span>';
                break;
            }
        }

        html = '<span class="dropdown body submenu" id="sm_move"><span id="csb_move">'
            + '<span class="dropdown-item cloud-item' + cs + '" id="fi_' + this.RootID + '">'
            + '<i class="small-icon context cloud"></i>' + l[164] + '</span>' + sm
            + '<span class="dropdown-item remove-item" id="fi_' + this.RubbishID + '">'
            + '<i class="small-icon context remove-to-bin"></i>' + l[168] + '</span>'
            + '<hr /><span class="dropdown-item advanced-item"><i class="small-icon context aim"></i>'
            + l[9108] + '</span>' + arrow + '</span></span>';

        $('.dropdown-item.move-item').after(html);
    };

    /*
     * buildSubMenu - context menu related
     * Create sub-menu for context menu parent directory
     *
     * @param {string} id - parent folder handle
     */
    MegaData.prototype.buildSubMenu = function(id) {

        var folders = [],
            sub, cs, sm, fid, sharedFolder, html;
        var nodeName = '';

        for (var i in this.c[id]) {
            if (this.d[i] && this.d[i].t === 1) {
                folders.push(this.d[i]);
            }
        }

        // Check existance of sub-menu
        if ($('#csb_' + id + ' > .dropdown-item').length !== folders.length) {
            // localeCompare is not supported in IE10, >=IE11 only
            // sort by name is default in the tree
            folders.sort(function(a, b) {
                if (a.name) {
                    return a.name.localeCompare(b.name);
                }
            });

            for (var i in folders) {
                sub = false;
                cs = '';
                sm = '';
                fid = folders[i].h;

                for (var h in this.c[fid]) {
                    if (this.d[h] && this.d[h].t) {
                        sub = true;
                        cs = ' contains-submenu';
                        sm = '<span class="dropdown body submenu" id="sm_' + fid + '">'
                            + '<span id="csb_' + fid + '"></span>' + arrow + '</span>';
                        break;
                    }
                }

                sharedFolder = 'folder-item';
                if (typeof this.d[fid].shares !== 'undefined') {
                    sharedFolder += ' shared-folder-item';
                }

                if (missingkeys[fid]) {
                    nodeName = l[8686];
                }
                else {
                    nodeName = this.d[fid].name;
                }

                html = '<span class="dropdown-item ' + sharedFolder + cs + '" id="fi_' + fid + '">'
                    + '<i class="small-icon context ' + sharedFolder + '"></i>'
                    + htmlentities(nodeName) + '</span>' + sm;

                $('#csb_' + id).append(html);
            }
        }
    };
})(this);

/**
 * Build an array of context-menu items to show for the selected node
 * @returns {MegaPromise}
 */
MegaData.prototype.menuItems = function menuItems() {
    "use strict";

    var promise = new MegaPromise();

    dbfetch.geta($.selected || [])
        .always(function() {
            promise.resolve(M.menuItemsSync());
        });

    return promise;
};

/**
 * Build an array of context-menu items to show for the selected node
 * @returns {Object}
 */
MegaData.prototype.menuItemsSync = function menuItemsSync() {
    "use strict";

    var selItem,
        items = Object.create(null),
        share = {},
        exportLink = {},
        isTakenDown = false,
        hasExportLink = false,
        sourceRoot = M.getNodeRoot($.selected[0]);

    // Show Rename action in case that only one item is selected
    if (($.selected.length === 1) && (M.getNodeRights($.selected[0]) > 1)) {
        items['.rename-item'] = 1;
    }

    if (((Object.keys($.selected)).length < 2)
        && (M.getNodeRights($.selected[0]) > 1)) {

        items['.add-star-item'] = 1;

        if (M.isFavourite($.selected)) {
            $('.add-star-item').safeHTML('<i class="small-icon context broken-heart"></i>@@', l[5872]);
        }
        else {
            $('.add-star-item').safeHTML('<i class="small-icon context heart"/></i>@@', l[5871]);
        }

        items['.colour-label-items'] = 1;
        M.colourLabelcmUpdate(M.d[$.selected[0]]);
    }

    selItem = M.d[$.selected[0]];

    if (selItem && selItem.su && !M.d[selItem.p]) {
        items['.removeshare-item'] = 1;
    }
    else if (M.getNodeRights($.selected[0]) > 1) {
        items['.move-item'] = 1;
        items['.remove-item'] = 1;
    }

    if (selItem && $.selected.length === 1) {
        if (selItem.t) {
            if (M.currentdirid !== selItem.h) {
                items['.open-item'] = 1;
            }

            if (sourceRoot === M.RootID && !folderlink) {
                items['.sh4r1ng-item'] = 1;
            }
        }
        else if (is_image(selItem)) {
            items['.preview-item'] = 1;
        }
    }

    if ((sourceRoot === M.RootID) && !folderlink) {
        items['.move-item'] = 1;
        items['.getlink-item'] = 1;

        share = new mega.Share();
        hasExportLink = share.hasExportLink($.selected);

        if (hasExportLink) {
            items['.removelink-item'] = true;
        }

        exportLink = new mega.Share.ExportLink();
        isTakenDown = exportLink.isTakenDown($.selected);

        // If any of selected items is taken down remove actions from context menu
        if (isTakenDown) {
            delete items['.getlink-item'];
            delete items['.removelink-item'];
            delete items['.sh4r1ng-item'];
            delete items['.add-star-item'];
            delete items['.colour-label-items'];
        }
    }

    else if (sourceRoot === M.RubbishID && !folderlink) {
        items['.move-item'] = 1;
    }

    if (selItem) {
        items['.download-item'] = 1;
        items['.zipdownload-item'] = 1;
        items['.copy-item'] = 1;
        items['.properties-item'] = 1;
    }
    items['.refresh-item'] = 1;

    if (folderlink) {
        delete items['.copy-item'];
        delete items['.add-star-item'];
        delete items['.colour-label-items'];
        items['.import-item'] = 1;
    }

    return items;
};

/**
 * Show a context menu for the selected node.
 * @param {Event} e The event being dispatched
 * @param {Number} ll The type of context menu.
 */
MegaData.prototype.contextMenuUI = function contextMenuUI(e, ll) {
    "use strict";

    var flt;
    var async = false;
    var m = $('.dropdown.body.files-menu');

    // Selection of first child level ONLY of .dropdown-item in .dropdown.body
    var menuCMI = '.dropdown.body.files-menu .dropdown-section > .dropdown-item';
    var currNodeClass = $(e.currentTarget).attr('class');
    var id = $(e.currentTarget).attr('id');

    // is contextmenu disabled
    if (localStorage.contextmenu) {
        return true;
    }

    var showContextMenu = function() {
        // This part of code is also executed when ll == 'undefined'
        var v = m.children('.dropdown-section');

        // Count all items inside section, and hide dividers if necessary
        v.each(function() {
            var $this = $(this);
            var a = $this.find('a.dropdown-item');
            var x = a.filter(function() {
                return $(this).css('display') === 'none';
            });
            if (x.length === a.length || a.length === 0) {
                $this.addClass('hidden');
            }
            else {
                $this.removeClass('hidden');
            }
        });

        M.adjustContextMenuPosition(e, m);

        M.disableCircularTargets('#fi_');

        m.removeClass('hidden');

        // Hide last divider
        v.find('hr').removeClass('hidden');
        m.find('.dropdown-section:visible:last hr').addClass('hidden');
    };
    $.hideContextMenu();

    // Used when right click is occured outside item, on empty canvas
    if (ll === 2) {

        // Enable upload item menu for clould-drive, don't show it for rubbish and rest of crew
        if (M.getNodeRights(M.currentdirid) && (M.currentrootid !== M.RubbishID)) {
            $(menuCMI).filter('.dropdown-item').hide();
            $(menuCMI).filter('.fileupload-item,.newfolder-item').show();

            if ((is_chrome_firefox & 2) || 'webkitdirectory' in document.createElement('input')) {
                $(menuCMI).filter('.folderupload-item').show();
            }
        }
        else {
            return false;
        }
    }
    else if (ll === 3) {// we want just the download menu
        $(menuCMI).hide();
        m = $('.dropdown.body.download');
        menuCMI = '.dropdown.body.download .dropdown-item';
        $(menuCMI).show();
    }
    else if (ll === 4 || ll === 5) {// contactUI
        $(menuCMI).hide();

        async = true;
        M.menuItems()
            .done(function(items) {

                delete items['.download-item'];
                delete items['.zipdownload-item'];
                delete items['.copy-item'];
                delete items['.open-item'];

                if (ll === 5) {
                    delete items['.properties-item'];
                }

                for (var item in items) {
                    $(menuCMI).filter(item).show();
                }

                onIdle(showContextMenu);
            });
    }
    else if (ll === 6) { // sort menu
        $('.dropdown-item').hide();
        $('.dropdown-item.do-sort').show();
    }
    else if (ll) {// Click on item

        // Hide all menu-items
        $(menuCMI).hide();

        id = $(e.currentTarget).attr('id');

        if (id) {

            // Contacts left panel click
            if (id.indexOf('contact_') !== -1) {
                id = id.replace('contact_', '');
            }

            // File manager left panel click
            else if (id.indexOf('treea_') !== -1) {
                id = id.replace('treea_', '');
            }
        }

        /*if (id && !M.d[id]) {

         // exist in node list
         id = undefined;
         }*/

        // In case that id belongs to contact, 11 char length
        if (id && (id.length === 11)) {
            flt = '.remove-item';
            if (!window.megaChatIsDisabled) {
                flt += ',.startchat-item,.startaudio-item,.startvideo-item';
            }
            $(menuCMI).filter(flt).show();

            $(menuCMI).filter('.startaudio-item,.startvideo-item').removeClass('disabled');

            // If selected contact is offline make sure that audio and video calls are forbiden (disabled)
            if ($('#' + id).find('.offline').length || $.selected.length > 1) {
                $(menuCMI).filter('.startaudio-item').addClass('disabled');
                $(menuCMI).filter('.startvideo-item').addClass('disabled');
            }

        }
        else if (currNodeClass && (currNodeClass.indexOf('cloud-drive') > -1
            || currNodeClass.indexOf('folder-link') > -1)) {
            flt = '.properties-item';
            if (folderlink) {
                flt += ',.import-item';
            }
            else {
                flt += ',.findupes-item';
            }
            if (M.v.length) {
                flt += ',.zipdownload-item,.download-item';
            }
            $.selected = [M.RootID];
            $(menuCMI).filter(flt).show();
        }
        else if (currNodeClass && $(e.currentTarget).hasClass('inbox')) {
            $.selected = [M.InboxID];
            $(menuCMI).filter('.properties-item').show();
        }
        else if (currNodeClass && currNodeClass.indexOf('rubbish-bin') > -1) {
            $.selected = [M.RubbishID];
            $(menuCMI).filter('.properties-item').show();
        }
        else if (currNodeClass && currNodeClass.indexOf('recycle-item') > -1) {
            $(menuCMI).filter('.clearbin-item').show();
        }
        else if (currNodeClass && currNodeClass.indexOf('contacts-item') > -1) {
            $(menuCMI).filter('.addcontact-item').show();
        }
        else if (currNodeClass && currNodeClass.indexOf('messages-item') > -1) {
            e.preventDefault();
            return false;
        }
        else if (currNodeClass
            && (currNodeClass.indexOf('file-block') > -1
            || currNodeClass.indexOf('folder') > -1
            || currNodeClass.indexOf('fm-tree-folder') > -1)
            || String(id).length === 8) {

            async = true;
            M.menuItems()
                .done(function(items) {
                    for (var item in items) {
                        $(menuCMI).filter(item).show();
                    }

                    // Hide context menu items not needed for undecrypted nodes
                    if (missingkeys[id]) {
                        $(menuCMI).filter('.add-star-item').hide();
                        $(menuCMI).filter('.download-item').hide();
                        $(menuCMI).filter('.rename-item').hide();
                        $(menuCMI).filter('.copy-item').hide();
                        $(menuCMI).filter('.getlink-item').hide();
                        $(menuCMI).filter('.colour-label-items').hide();
                    }
                    else if (M.getNodeShare(id).down === 1) {
                        $(menuCMI).filter('.copy-item').hide();
                    }
                    else if (items['.getlink-item']) {
                        onIdle(M.setContextMenuGetLinkText.bind(M));
                    }

                    onIdle(showContextMenu);
                });
        }
        else {
            return false;
        }

        //Hide Info item if properties dialog is opened
        if ($.dialog === 'properties') {
            $(menuCMI).filter('.properties-item').hide();
        }
    }

    if (!async) {
        showContextMenu();
    }

    e.preventDefault();
};

/**
 * Sets the text in the context menu for the Get link and Remove link items. If there are
 * more than one nodes selected then the text will be pluralised. If all the selected nodes
 * have public links already then the text will change to 'Update link/s'.
 */
MegaData.prototype.setContextMenuGetLinkText = function() {
    "use strict";

    var numOfExistingPublicLinks = 0;
    var numOfSelectedNodes = Object($.selected).length;
    var getLinkText = '';

    // Loop through all selected nodes
    for (var i = 0; i < numOfSelectedNodes; i++) {

        // Get the node handle of the current node
        var nodeHandle = $.selected[i];

        // If it has a public link, then increment the count
        if (M.getNodeShare(nodeHandle)) {
            numOfExistingPublicLinks++;
        }
    }

    // If all the selected nodes have existing public links, set text to 'Update links' or 'Update link'
    if (numOfSelectedNodes === numOfExistingPublicLinks) {
        getLinkText = (numOfSelectedNodes > 1) ? l[8733] : l[8732];
    }
    else {
        // Otherwise change text to 'Get links' or 'Get link' if there are selected nodes without links
        getLinkText = (numOfSelectedNodes > 1) ? l[8734] : l[59];
    }

    // If there are multiple nodes with existing links selected, set text to 'Remove links', otherwise 'Remove link'
    var removeLinkText = (numOfExistingPublicLinks > 1) ? l[8735] : l[6821];

    // Set the text for the 'Get/Update link/s' and 'Remove link/s' context menu items
    var $contextMenu = $('.dropdown.body');
    $contextMenu.find('.getlink-item span').text(getLinkText);
    $contextMenu.find('.removelink-item span').text(removeLinkText);
};


MegaData.prototype.adjustContextMenuPosition = function(e, m) {
    "use strict";

    var mPos;// menu position
    var mX = e.clientX, mY = e.clientY; // mouse cursor, returns the coordinates within the application's client area
                                        // at which the event occurred (as opposed to the coordinates within the page)

    if (e.type === 'click' && !e.calculatePosition) {
        // clicked on file-settings-icon
        var ico = {'x': e.currentTarget.context.clientWidth, 'y': e.currentTarget.context.clientHeight};
        var icoPos = getHtmlElemPos(e.delegateTarget);// get position of clicked file-settings-icon
        mPos = M.reCalcMenuPosition(m, icoPos.x, icoPos.y, ico);
    }
    else {
        // right click
        mPos = M.reCalcMenuPosition(m, mX, mY);
    }

    m.css({'top': mPos.y, 'left': mPos.x});// set menu position

    return true;
};

/**
 * Calculates coordinates where context menu will be shown
 * @param {Object} m jQuery object of context menu or child class
 * @param {Number} x Coordinate x of cursor or clicked element
 * @param {Number} y Coordinate y of cursor or clicked element
 * @param {Object} ico JSON {x, y} width and height of element clicked on
 * @returns {Object} Coordinates {x, y} where context menu will be drawn
 */
MegaData.prototype.reCalcMenuPosition = function(m, x, y, ico) {
    "use strict";

    var TOP_MARGIN = 12;
    var SIDE_MARGIN = 12;
    var cmW = m.outerWidth();// dimensions without margins calculated
    var cmH = m.outerHeight();// dimensions without margins calculated
    var wH = window.innerHeight;
    var wW = window.innerWidth;
    var maxX = wW - SIDE_MARGIN;// max horizontal coordinate, right side of window
    var maxY = wH - TOP_MARGIN;// max vertical coordinate, bottom side of window

    // min horizontal coordinate, left side of right panel
    var minX = SIDE_MARGIN + $('div.nw-fm-left-icons-panel').outerWidth();
    var minY = TOP_MARGIN;// min vertical coordinate, top side of window
    var wMax = x + cmW;// coordinate of context menu right edge
    var hMax = y + cmH;// coordinate of context menu bottom edge

    var top = 'auto';
    var left = '100%';
    var right = 'auto';

    var overlapParentMenu = function(n) {
        var tre = wW - wMax;// to right edge
        var tle = x - minX - SIDE_MARGIN;// to left edge

        if (tre >= tle) {
            n.addClass('overlap-right');
            n.css({'top': top, 'left': (maxX - x - nmW) + 'px'});
        }
        else {
            n.addClass('overlap-left');
            n.css({'top': top, 'right': (wMax - nmW - minX) + 'px'});
        }


    };

    /**
     * Calculates top position of submenu
     * Submenu is relatively positioned to the first sibling element
     * @param {Object} n jQuery object, submenu of hovered element
     * @returns {String} top Top coordinate in pixels for submenu
     */
    var horPos = function(n) {
        var top;
        var nTop = parseInt(n.css('padding-top'));
        var tB = parseInt(n.css('border-top-width'));
        var pPos = m.position();
        var b = y + nmH - (nTop - tB);// bottom of submenu
        var mP = m.closest('.dropdown.body.submenu');
        var pT = 0;
        var bT = 0;
        var pE = 0;

        if (mP.length) {
            pE = mP.offset();
            pT = parseInt(mP.css('padding-top'));
            bT = parseInt(mP.css('border-top-width'));
        }
        if (b > maxY) {
            top = (maxY - nmH + nTop - tB) - pE.top + 'px';
        }
        else {
            top = pPos.top - tB + 'px';
        }

        return top;
    };

    var dPos;// new context menu position
    var cor;// corner, check setBordersRadius for more info
    if (typeof ico === 'object') {// draw context menu relative to file-settings-icon
        cor = 1;
        dPos = {'x': x - 2, 'y': y + ico.y + 8};// position for right-bot

        // draw to the left
        if (wMax > maxX) {
            dPos.x = x - cmW + ico.x + 2;// additional pixels to align with -icon
            cor = 3;
        }

        // draw to the top
        if (hMax > (maxY - TOP_MARGIN)) {
            dPos.y = y - cmH - 6;
            if (dPos.y < TOP_MARGIN) {
                dPos.y = TOP_MARGIN;
            }
            cor++;
        }
    }
    else if (ico === 'submenu') {// submenues
        var n = m.next('.dropdown.body.submenu');
        var nmW = n.outerWidth();// margin not calculated
        var nmH = n.outerHeight();// margins not calculated

        if (nmH > (maxY - TOP_MARGIN)) {// Handle huge menu
            nmH = maxY - TOP_MARGIN;
            var tmp = document.getElementById('csb_' + String(m.attr('id')).replace('fi_', ''));
            if (tmp) {
                $(tmp).addClass('context-scrolling-block');
                tmp.addEventListener('mousemove', M.scrollMegaSubMenu.bind(this));

                n.addClass('mega-height');
                n.css({'height': nmH + 'px'});
            }
        }

        top = horPos(n);
        if (m.parent().parent('.left-position').length === 0) {
            if (maxX >= (wMax + nmW)) {
                left = 'auto';
                right = '100%';
            }
            else if (minX <= (x - nmW)) {
                n.addClass('left-position');
            }
            else {
                overlapParentMenu(n);

                return true;
            }
        }
        else {
            if (minX <= (x - nmW)) {
                n.addClass('left-position');
            }
            else if (maxX >= (wMax + nmW)) {
                left = 'auto';
                right = '100%';
            }
            else {
                overlapParentMenu(n);

                return true;
            }
        }

        return {'top': top, 'left': left, 'right': right};
    }
    else {// right click
        cor = 0;
        dPos = {'x': x, 'y': y};
        if (x < minX) {
            dPos.x = minX;// left side alignment
        }
        if (wMax > maxX) {
            dPos.x = maxX - cmW;// align with right side
        }

        if (hMax > maxY) {
            dPos.y = maxY - cmH;// align with bottom
        }
    }

    M.setBordersRadius(m, cor);

    return {'x': dPos.x, 'y': dPos.y};
};

// corner position 0 means default
MegaData.prototype.setBordersRadius = function(m, c) {
    "use strict";

    var DEF = 8;// default corner radius
    var SMALL = 4;// small carner radius
    var TOP_LEFT = 1, TOP_RIGHT = 3, BOT_LEFT = 2, BOT_RIGHT = 4;
    var tl = DEF, tr = DEF, bl = DEF, br = DEF;

    var pos = (typeof c === 'undefined') ? 0 : c;

    switch (pos) {
        case TOP_LEFT:
            tl = SMALL;
            break;
        case TOP_RIGHT:
            tr = SMALL;
            break;
        case BOT_LEFT:
            bl = SMALL;
            break;
        case BOT_RIGHT:
            br = SMALL;
            break;
        default:// situation when c is undefined, all border radius are by DEFAULT
            break;

    }

    // set context menu border radius
    m.css({
        'border-top-left-radius': tl,
        'border-top-right-radius': tr,
        'border-bottom-left-radius': bl,
        'border-bottom-right-radius': br
    });

    return true;
};

// Scroll menus which height is bigger then window.height
MegaData.prototype.scrollMegaSubMenu = function(e) {
    "use strict";

    var ey = e.pageY;
    var c = $(e.target).closest('.dropdown.body.submenu');
    var pNode = c.children(':first')[0];

    if (typeof pNode !== 'undefined') {
        var h = pNode.offsetHeight;
        var dy = h * 0.1;// 10% dead zone at the begining and at the bottom
        var pos = getHtmlElemPos(pNode, true);
        var py = (ey - pos.y - dy) / (h - dy * 2);

        if (py > 1) {
            py = 1;
            c.children('.context-bottom-arrow').addClass('disabled');
        }
        else if (py < 0) {
            py = 0;
            c.children('.context-top-arrow').addClass('disabled');
        }
        else {
            c.children('.context-bottom-arrow,.context-top-arrow').removeClass('disabled');
        }
        pNode.scrollTop = py * (pNode.scrollHeight - h);
    }
};
