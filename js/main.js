(function ($) {
    $('.article img:not(".not-gallery-item")').each(function () {
        // wrap images with link and add caption if possible
        if ($(this).parent('a').length === 0) {
            $(this).wrap('<a class="gallery-item" href="' + $(this).attr('src') + '"></a>');
            if (this.alt) {
                $(this).after('<div class="has-text-centered is-size-6 has-text-grey caption">' + this.alt + '</div>');
            }
        }
    });

    if (typeof (moment) === 'function') {
        $('.article-meta time').each(function () {
            $(this).text(moment($(this).attr('datetime')).fromNow());
        });
    }

    $('.article > .content > table').each(function () {
        if ($(this).width() > $(this).parent().width()) {
            $(this).wrap('<div class="table-overflow"></div>');
        }
    });

    function adjustNavbar() {
        const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        if ($(document).outerWidth() < navbarWidth) {
            $('.navbar-main .navbar-menu').addClass('is-flex-start');
        } else {
            $('.navbar-main .navbar-menu').removeClass('is-flex-start');
        }
    }
    adjustNavbar();
    $(window).resize(adjustNavbar);

    $('figure.highlight table').wrap('<div class="highlight-body">');
    if (typeof (IcarusThemeSettings) !== 'undefined' &&
        typeof (IcarusThemeSettings.article) !== 'undefined' &&
        typeof (IcarusThemeSettings.article.highlight) !== 'undefined') {

        $('figure.highlight').addClass('hljs');
        $('figure.highlight .code .line span').each(function () {
            const classes = $(this).attr('class').split(/\s+/);
            if (classes.length === 1) {
                $(this).addClass('hljs-' + classes[0]);
                $(this).removeClass(classes[0]);
            }
        });

        var fold = IcarusThemeSettings.article.highlight.fold;
        if (fold.trim()) {
            var button = '<span class="fold">' + (fold === 'unfolded' ? '<i class="material-icons">keyboard_arrow_down</i>' : '<i class="material-icons">keyboard_arrow_right</i>') + '</span>';
            $('figure.highlight').each(function () {
                if ($(this).find('figcaption')) {
                    // 此处find ">folded" span,如果有自定义code头,并且">folded"进行处理
                    // 使用示例，.md 文件中头行标记">folded"
                    // ```java main.java >folded
                    // import main.java
                    // private static void main(){
                    //     // test
                    //     int i = 0;
                    //     return i;
                    // }
                    // ```
                    if ($(this).find('figcaption').find('span')) {
                        let span = $(this).find('figcaption').find('span')[0]
                        if (span && span.innerText.indexOf(">folded") > -1) {
                            // 去掉folded
                            span.innerText = span.innerText.replace(">folded", "").trim()
                            button = '<span class="fold"><i class="material-icons">keyboard_arrow_right</i></span>';
                            $(this).find('figcaption').prepend(button);

                            // 收叠代码块
                            toggleFold(this, true);
                            return;
                        }
                    }
                    $(this).find('figcaption').prepend(button);
                }
                toggleFold(this, fold === 'folded');
            });

            function toggleFold(codeBlock, isFolded) {
                var $toggle = $(codeBlock).find('.fold i');
                !isFolded ? $(codeBlock).removeClass('folded') : $(codeBlock).addClass('folded');
                !isFolded ? $toggle.text('keyboard_arrow_down') : $toggle.text('keyboard_arrow_right');
            }

            // $('figure.highlight').each(function () {
            //     toggleFold(this, fold === 'folded');
            // });
            $('figure.highlight figcaption').click(function (e) {
                if (e.target.parentElement.tagName === 'A') return
                var $code = $(this).closest('figure.highlight');
                toggleFold($code.eq(0), !$code.hasClass('folded'));
            });
        }

        $('figure.highlight').each(function () {
            let span = $(this).find('figcaption').find('span')[1]
            if (span && span.innerText.indexOf(">") > -1) {
                let item = span.innerText.split('>')[1].split(',')
                let start = parseInt(item[0])
                let mark = parseInt(item[1])
                let lines = $(this).find('.highlight-body .code span.line')
                $(this).find('.highlight-body .gutter').find('span').each(function () {
                    let num = parseInt($(this).text()) + start - 1
                    $(this).text(num)
                    if (mark && num === mark) {
                        $(lines[mark - start]).addClass('marked')
                    }
                })
                $(span).text($(span).text().substring(0, $(span).text().indexOf('>')).trim())
                if ($(span).text().length == 0) {
                    $(this).find('figcaption').remove()
                }
            }
        })

        $('figure.highlight .highlight-body .code pre').each(function () {
            $(this).find('br').remove()
            $(this).find('span').each(function () {
                if ($(this).is(':empty')) $(this).text(' ')
            })
        })

        if (typeof (ClipboardJS) !== 'undefined' && IcarusThemeSettings.article.highlight.clipboard) {
            $('figure.highlight').each(function () {
                var id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                var button = '<a href="javascript:;" class="copy" title="Copy" data-clipboard-target="#' + id + ' .code"><i class="material-icons">content_copy</i></a>';
                $(this).attr('id', id);
                if ($(this).find('figcaption').length) {
                    $(this).find('figcaption').append(button);
                } else {
                    $(this).find('div').prepend(button)
                }
            });
            new ClipboardJS('.highlight .copy');
        }
    }

    var $toc = $('#toc');
    if ($toc.length > 0) {
        var $mask = $('<div>');
        $mask.attr('id', 'toc-mask');

        $('body').append($mask);

        function toggleToc() {
            $toc.toggleClass('is-active');
            $mask.toggleClass('is-active');
        }

        $toc.on('click', toggleToc);
        $mask.on('click', toggleToc);
        $('.navbar-main .catalogue').on('click', toggleToc);
    }

    // hexo-util/lib/is_external_link.js
    function isExternalLink(input, sitehost, exclude) {
        try {
            sitehost = new URL(sitehost).hostname;
        } catch (e) { }

        if (!sitehost) return false;

        // handle relative url
        const data = new URL(input, 'http://' + sitehost);

        // handle mailto: javascript: vbscript: and so on
        if (data.origin === 'null') return false;

        const host = data.hostname;

        if (exclude) {
            exclude = Array.isArray(exclude) ? exclude : [exclude];

            if (exclude && exclude.length) {
                for (const i of exclude) {
                    if (host === i) return false;
                }
            }
        }

        if (host !== sitehost) return true;

        return false;
    }

    if (typeof (IcarusThemeSettings) !== 'undefined' &&
        typeof (IcarusThemeSettings.site.url) !== 'undefined' &&
        typeof (IcarusThemeSettings.site.external_link) !== 'undefined' &&
        IcarusThemeSettings.site.external_link.enable) {
        $('.article .content a').filter(function (i, link) {
            return link.href &&
                !$(link).attr('href').startsWith('#') &&
                link.classList.length === 0 &&
                isExternalLink(link.href,
                    IcarusThemeSettings.site.url,
                    IcarusThemeSettings.site.external_link.exclude);
        }).each(function (i, link) {
            link.relList.add('noopener');
            link.target = '_blank';
        });
    }

    $('.fa-ig').addClass('fa-instagram')
    $('.fa-ig').removeClass('fa-ig')

    // https://github.com/squidfunk/mkdocs-material/blob/6b869f1d74eb347fbb310c86e05a9594f78c42bc/src/assets/javascripts/components/Material/Source/Adapter/GitHub.js
    if (typeof (IcarusThemeSettings) !== 'undefined' &&
        typeof (IcarusThemeSettings.github.url) !== 'undefined') {
        const url = IcarusThemeSettings.github.url
        const matches = /^.+github\.com\/([^/]+)\/?([^/]+)?.*$/.exec(url)
        if (matches && matches.length === 3) {
            const [, user, name] = matches
            const api = `https://api.github.com/users/${user}/repos`
            const paginate = (page = 0) => (
                fetch(`${api}?per_page=100&sort=updated&page=${page}`)
                .then(response => response.json())
                .then(data => {
                    if (!(data instanceof Array))
                        return []
            
                    /* Display number of stars and forks, if repository is given */
                    if (name) {
                        const repo = data.find(item => item.name === name)
                        if (!repo && data.length === 30) return paginate(page + 1)
            
                        if (typeof repo.stargazers_count !== 'number' || typeof repo.forks_count !== 'number') return []
                        /* If we found a repo, extract the facts */
                        return repo
                        ? [
                            `${repo.stargazers_count} Stars`,
                            `${repo.forks_count} Forks`
                        ]
                        : []
            
                    /* Display number of repositories, otherwise */
                    } else {
                        return [
                        `${data.length} Repositories`
                        ]
                    }
                })
            )
            paginate().then(data => {
                const [stars, forks] = data
                const facts = $(`<ul class="github-facts"><li id="github-stars">${stars}</li><li id="github-forks">• ${forks}</li></ul>`)
                $('.github-source-repository').append(facts)
            })
        }
    }
})(jQuery);
