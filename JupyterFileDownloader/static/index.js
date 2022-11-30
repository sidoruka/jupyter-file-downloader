define([
    'base/js/namespace',
    'base/js/events'
    ], function(Jupyter, events) {

        function path_join(parts, sep){
            var separator = sep || '/';
            var replace   = new RegExp(separator+'{1,}', 'g');
            return parts.join(separator).replace(replace, separator);
        }

        function get_display_object(type, params) {
            if (type === 'link' ) {
                const filename = params.filepath.replace(/^.*[\\\/]/, '');
                const uri = new URL(path_join([Jupyter.notebook.config.base_url, '/jupyter-file-downloader', params.filepath]), location.origin).href;
                return  {
                            'output_type': 'execute_result',
                            'data': {
                                'text/plain': '<IPython.core.display.HTML object>',
                                'text/html': '<a href="' + uri + '" target="_blank">Download <b>' + filename + '</b></a>'
                            },
                            'metadata': {}
                        };
            }
            return null;
        }

        function load_ipython_extension() {
            Jupyter.notebook.events.on('execute.CodeCell', function(evt, data) {
                const cell = data.cell;
                // Parse out all the occurences of
                // `#% <command> <argument>`
                // E.g. `#% link /path/to/my/file`
                const rp_magics = /^#%\s+(.+?(?=\s))\s*(.+)/gm;
                while (match = rp_magics.exec(cell.get_text())) {
                    if (match.length < 3) continue
                    display_object = get_display_object(match[1], { 'filepath': match[2] });
                    if (display_object) {
                        data.cell.output_area.append_display_data(display_object);
                    }
                }
            });
        }

        return {
            'load_ipython_extension': load_ipython_extension
        }
});
