init_pars( {
        'db': '',
});

function create_menus(data) {
                console.log(data);
                var db = get_par( "db" );
                // Init menu
                var i = 0;
                defdb = [];
                for(var g in data) {
                        var db = g.db;
                        $("#db").append( $( "<option />", { value: db, text: g } ) );
                        defdb.push(db);
                        i++;
                }
                
                if (!db) {
                        db = defdb[0];
                        set_par( "db", db );
                }
                $('db').val(db).attr("selected", true);
                update_links();
}
        
function update_links() {
                // Update dotplot link
                var dotpars = {
                        "db": get_par( "db" ),
                };
}
        
// First actions!
$(function() {
        pars = get_url_parameters();
        pars.type = 'databases';
        pars.userdb = 'true';
        $.getJSON( urls.get_data, pars, create_menus )
        create_id_box()
});

function create_id_box() {
        $box = $( "#id_box" );
        $box.empty();
        $basic = $( "<span id='basic_box'>" );
        $basic
        .hide()
        .append( "<span>Show breaks of size at least </span>" )
        $basic.show();
}