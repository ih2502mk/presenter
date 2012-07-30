A modular tool to show presentations
====================================

Main goal is to explore modularity and separation of concerns in javaScript fronted applications.

Usage
-----

Create a bunch of block elements (preferably divs) with content. Where each div is a slide. Then add
    
    <script>
      $(document).ready(function(){
        $('#all.my.slides').presenter();
      });
    </script>

where '#all.my.slides' is a selector of previously created divs.
