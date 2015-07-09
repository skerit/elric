/**
 * Elric: an alchemy based home automation system
 * Copyright 2013-2014
 *
 * Licensed under The GPL v3
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright   Copyright 2013-2014
 * @since       0.0.1
 * @version     1.0.0
 * @license     GPL v3
 */
alchemy.usePlugin('chimera', {title: 'Elric'});
alchemy.usePlugin('styleboost');
alchemy.usePlugin('media');
alchemy.usePlugin('menu');

alchemy.hawkejs.on({type: 'viewrender', status: 'begin', client: false}, function onBegin(viewRender) {
	var sections = {
		'administration' : {
			'settings'  :         {title: 'Settings',          type: 'SettingsAction', parameters: {controller: 'settings',     subject: 'settings',          action: 'index'}},
			'i18n':               {title: 'Translations',      type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'i18n',              action: 'index'}},
			'user':               {title: 'Users',             type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'users',             action: 'index'}},
			'groups':             {title: 'User Groups',       type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'acl_groups',        action: 'index'}},
			'rules':            {title: 'ACL',               type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'acl_rules',         action: 'index'}}
		},
		'website' : {
			'menu'       :        {title: 'Menu',              type: 'ModelAction',    parameters: {controller: 'MenuManager',  subject: 'menus',             action: 'index'}},
			'media'      :        {title: 'Media',             type: 'ModelAction',    parameters: {controller: 'MediaGallery', subject: 'media_files',       action: 'gallery'}},
			'pages'      :        {title: 'Pages',             type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'pages',             action: 'index'}}
		},
		'elric' : {
			'room'       :        {title: 'Room',              type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'rooms',             action: 'index'}},
			'room_element':       {title: 'Room Element',      type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'room_elements',     action: 'index'}},
			'interface':          {title: 'Interface',         type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'interfaces',        action: 'index'}},
			'device':             {title: 'Device',            type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'devices',           action: 'index'}},
			'client':             {title: 'Client',            type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'clients',           action: 'index'}},
			'client_capability':  {title: 'Client Capibility', type: 'ModelAction',    parameters: {controller: 'editor',       subject: 'client_capibilities',action: 'index'}}
		}
	};

	viewRender.script('menu/treeify');
	viewRender.set('sections', sections);
	viewRender.set('project_title', 'Elric');
});