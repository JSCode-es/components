const language = ( ) =>
{
    // Nombre del componente
    const component = 'data-language';
        
    class Language extends HTMLElement
    {
        static cache:object = {};

        constructor()
        {
            super();
        }

        static async ajax (data:Record< string, string> = {})
        {   
            let params:string = new URLSearchParams(data).toString();

            params = params.length === 0 ? '' : '?'+params;
            
            let url:string  = `${location.origin}/${params}`;

            let opt:RequestInit  = 
            { 
                method:'GET',
                headers:
                {
                    'Accept': 			'application/json',
                    'Content-Type': 	'application/json',
                },
                mode: 'cors',
                cache: 'default'
            };
            
            let { code, result }  = await fetch(url,opt).then(data=>data.json());
            
            return (code === 200) ? result : [];
           
        }

        static async translate(lang:string)
        {
            let trans = null;
            let cache = Language.cache;

            if(!cache[lang])
            {
                let data = await Language.ajax({change_lang:lang,ns:'login'});      
              
                trans = Language.cache[lang] = data;
                
            } else {  trans = Language.cache[lang]; }
            
            let elements = document.querySelectorAll('[data-lang]');

            for (let i = 0; i < elements.length; i++) 
            {
                const item = elements[i];
                //console.dir(item);
                let method = 'innerHTML'

                if(item.tagName == 'INPUT')
                { 
                    method = 'placeholder';
                } 

                item[method] = trans[item.getAttribute('data-lang')];
            }
          
        }

        async connectedCallback()
        {
            // Solicitar los idiomas disponibles
            let languages:Array<string> = await Language.ajax({getLang:'1'});

            let selected:string = this.getAttribute('data-default');
            let list:string     = '';
            
            for (const item of languages) 
            {
                if(item!=selected)
                {
                    list+=`<span class="change_lang" data-lang="${item}">${item}</span>`
                }
            }
            
            let html = `
            <link rel="stylesheet" href="assets/css/language.css">
            <div id="language" class="language-block">
                <div class="selected">${selected}</div>
                <div class="options">${list}</div>
            </div>`

            const shadowRoot = this.attachShadow({mode: 'open'});

            shadowRoot.innerHTML = html;
            
            let root = document.querySelector('data-language');
            
            setTimeout(()=>{ root.className = (root.className).replaceAll('d-none','') },250)
            
            let block   = shadowRoot.querySelector('.language-block');
            let options = block.querySelector('.options').querySelectorAll('.change_lang');
            let last    = block.querySelector('.selected');
          
            for (const option of options) 
            {
                option.addEventListener('click',function(){
               
                    if(this.hasAttribute('data-lang'))
                    {
                        let attr = this.getAttribute('data-lang');
                     
                        this.innerHTML = last.innerHTML;
                        this.setAttribute('data-lang',last.innerHTML);

                        last.innerHTML = attr;  

                        Language.translate(attr);
                    }
                   
                });
                
            }

        }
    }

    window.customElements.define(component,Language);
    
}

export default language;