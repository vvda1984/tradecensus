﻿function useLanguage() {
    return language_en();
    // Load language here...
}

function language_en() {
    return {
        btn_close: 'CLOSE',
		btn_save: 'SAVE',
        btn_cancel: 'CANCEL',
        btn_delete: 'DELETE',
		btn_login: 'LOGIN',
        btn_exit: 'EXIT',
        btn_download: 'Download',
        btn_redownload: 'Redownload',
        btn_deleteOffline: 'Delete',
        btn_sync: 'SYNC',
        btn_logout: 'LOGOUT',
        btn_post: 'POST',
        btn_revise: 'REVISE',
        btn_revert: 'RESET',
        btn_approve: 'APPROVE',
        btn_deny: 'DENY',
        btn_back: 'BACK',
        btn_view: 'VIEW',
        btn_view_journals: 'View History',
        btn_clear_journals: 'Clear History',
        btn_start_journal_tracking: 'Start Track Journal',
        btn_stop_journal_tracking: 'Stop Track Journal',
      
        btn_changePassword : 'CHANGE PASSWORD',
        label_select_zone: 'SELECT ZONE',
        label_select_area: 'Please select Area',
        label_deleting: 'Deleting',
        label_validating: 'Validating',
        err_download_province: 'Not successful! Please try again',

        version : 'Version',
        submitting: 'SUBMITTING',
        cannot_change_password_in_offline: 'Cannot change password in offline mode!',
        enter_current_password: 'Current Password',
        enter_new_password: 'New Password',
        enter_confirm_password: 'Confirm Password',
        current_pass_is_empty: 'Current password is empty!',
        new_pass_is_empty: 'New password is empty!',
        confirm_pass_doesnot_match: 'Confirm password does not match!',
		
        connecting_server: 'Connecting to server',
        loading_map : 'Loading map',
        please_wait: 'Please wait...',
        enter_username: 'Enter Username',
        enter_password: 'Enter Password',
        
        password_is_empty: 'Password is empty!',
        username_is_empty: 'Username is empty!',
        timeout_is_empty: 'Timeout is empty!',
		settings: 'SETTINGS',
        enter_ip_address: 'Enter IP Address',
        enter_port: 'Enter Port',
        enter_protocol: 'Enter Protocol',
        enter_time_out : 'Timeout',
        mode_online_offline: 'Mode (Online/Offline)',
        working_province: 'Working Province',
        ip_is_empty: 'IP is empty!',
        port_is_empty: 'Port is empty!',
        update_settings: 'Update Settings',
        download_settings: 'Download Settings',        
        download_province: 'Download Provinces',
        download_outlet_types: 'DOWNLOAD OUTLET TYPES',
        download_map_icons: 'DOWNLOAD MAP ICONS',
        check_update: 'Check updates',
        title_new_version: 'NEW VERSION',
        distance: 'Distance',
        max_outlets: 'Max Outlets',
        page_size: 'Outlet Page Size',

        title_select_date: 'SELECT DATE',
        title_date_from: 'From',
        title_date_to: 'To',

		near_by_outlets: 'Near-by Outlets',
		new_outlets: 'New Outlets',
		my_new_outlets: 'My New Outlets',
        updated_outlets: 'Updated Outlets',
        auditted_outlets: 'Auditted Outlets',
        no_outlet_found: 'No outlet found',
        msg_found: 'Found ',
        msg_outlets: ' outlet(s)',

        address: 'Address',
        outlet_type: 'Outlet Type',
        phone: 'Phone',
        closed_date: 'Closed Date',
        last_visit: 'Last Visit',
        last_contact: 'Last Contact',
        tracking: 'Tracking',
        name: 'Name',
        last_change: 'Last Changed',
        search: 'Search',

        you_are_in_offline_mode: 'You are in Offline mode',
        hint_do_sync : 'Please do SYNC to apply changes',
        cannot_approve_or_deny: 'Cannot validate your location!',
        cannot_get_cur_location: 'Please turn on Location Services<br/>(Vui lòng mở tín hiệu vị trí)',
      
        download_outlets: 'DOWNLOAD OUTLETS',
        create_new_outlet: 'NEW OUTLET',
        edit_outlet: 'EDIT OUTLET',

		code : 'Code',
        location: 'Location',
        house_no: 'House No',
        ward: 'Ward',
        street: 'Street',
        district: 'District',
        province: 'Province',

        volumn: 'Avg Volume/Month',
        create_cartoons_avg_month: '(crates/cartons)',
        total: 'TOTAL',
        vbl_product: 'VBL Product',

        distance: 'Distance',
        code: 'Code',
        tracking: 'Tracked',
        non_tracking: 'None',
        opened: 'Opened',
        closed: 'Closed',
        audit_status: 'Audit New Outlet',
        approve: 'Approve',
        deny: 'Deny',
        revise: 'Revise',
        draft: 'Draft',        
        comment: 'Comment',
        revert: 'Reset',

        get_current_location: 'Get current location',
        synchronize_outlets: 'Synchronize Outlets',
        loading: 'Loading',
        loading_borders: 'Loading borders',
        save_outlet: 'Save Outlet',

        cannot_revise : 'The action is NOT allowed in offline mode',
        get: 'Get ',
        get_near_by_outlets: 'Get near-by outlets',
        found: 'Found ',
        outlets_loading: ' outlet(s). Loading...',
        saving_outlet: 'Saving Outlet',
        updating_image: 'Uploading image ',
        get_current_location: 'Get current location',
        all_outlets_have_been_synced: 'All outlets have been synced!',
        synchronize_completed: 'Synchronize completed!',
        query_error: 'Query error: ',
        distance_is_invalid: 'Distance is invalid!',
        max_outlet_is_invalid: 'Max Outlets is invalid!',

        an_error_has_occurred: 'An error has occurred: ',
        cannot_get_current_location: 'Cannot get current location',

        delete_outlet: 'Delete Outlet',
        delete_outlet_confirm: 'Are you sure you want to delete outlet "{outletname}"?',

        revert_outlet: 'Reset Outlet',
        revert_outlet_confirm: 'Are you sure you want to reset outlet "{outletname}"?',

        post_outlet: 'Post Outlet',
        post_outlet_confirm: 'Are you sure you want to POST outlet "{outletname}"?',

        revise_outlet: 'Revise Outlet',
        revise_outlet_confirm: 'Are you sure you want to REVISE outlet "{outletname}"?',
		
        approve_outlet: 'Approve Outlet',
        approve_outlet_confirm: 'Are you sure you want to APPROVE outlet "{outletname}"?',


        outlet_type_is_empty: 'Outlet type is empty!',
		outlet_name_is_empty : 'Outlet name is empty!',
		house_no_is_empty : 'House number is empty!',
		street_is_empty : 'Street is empty!',
		district_is_empty : 'District is empty!',
		phone_is_empty: 'Phone is empty!',
		comment_is_empty: 'Comment is empty!',
		ovar_audit_distance: ' Outlet is out of range ({value}m > {distance}m).',
		validate_distance: 'Could not save! You are out of range {distance}m from outlet.<br/>(Không thể lưu khi ở cách xa outlet hơn {distance}m)',
		total_is_invald: 'Total volume must be whole number',
		total_is_empty: 'Total volume must be greater than zero.',
		vbl_is_invald: ' VBL volume must be whole number',
		vbl_is_empty: 'VBL volume must greater than zero',
		vbl_cannot_greater_than_total: 'VBL volume can\'t be greater than Total volume.',
		need_to_capture: 'Please capture images before POST',
		msg_validate_accuracy: 'The accuracy ({curacc}m) is over {distance}m. Please try again',
		msg_validate_accuracy_1: 'Failed to locate outlet GPS. Please try with a clear view of sky<br/>(Tín hiệu GPS yếu, vui lòng di chuyển ra khu vực thông thoáng hơn)',
		msg_cannot_get_location: 'Get current location timeout!',

		confirm : 'CONFIRM',
		delete_offline_outlets_of : 'Delete offline outlets of ',
		unsynced_outlet_in_province: 'There are unsynced outlet(s). Please sync outlet(s) and try again!',
		validate_unsynced_outlets: 'Validating unsynced outlets',

        reach_maximum_download: 'Reach maximum download, please delete Provinces downloaded and try again!',

        validate_error: 'Error',
        error: 'Warning',        
        download_outlets_confim: 'Download offline outlet of ',

        downloading_outlet: 'DOWNLOADING OUTLETS ',
        downloading_outlet_msg: 'DOWNLOADING OUTLETS...{percent}%',
        downloading_outlet_get_outlets: 'Getting outlets...Please wait',
        downloading_outlet_save_outlets: 'Saving outlets to db...Please wait',
		check_network_connection : 'Please check network connection!',
		connection_timeout: 'Could not reach to the server, please try again!',
		invalid_user_password : 'Invalid User/Password',
		user_terminated: 'User has been terminated',
		download_network_warn: 'Please try again because network was not stable!',
		cancel_download_confirm: 'Do you want to cancel the download?',
		network_warn: 'Please try again because network was not stable!',

		open_close: "Status",
		tracking_status: 'Tracking',
		load_images: 'Loading outlet images',
		cannot_get_outlet_images: 'Cannot load outlet images!',
		get_journals: 'Get journal history',
		text_select_salesman: 'Select Salesman',
    }
};