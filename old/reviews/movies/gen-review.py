#!/usr/bin/env python3
"""
Usage:
    gen-review.py generate <name> [-c VALUE]
    gen-review.py calculate <name>

Options:
    -h --help           Show this screen.
    -c --chinese VALUE  Chinese movie name
"""
from docopt import docopt
import sys
from imdb import IMDb
from rotten_tomatoes_client import RottenTomatoesClient

rating = ['題材新鮮度', '卡司知名度', '劇情流暢度', '特效華麗度', '整體觀影感受']

def getIMDbScore():
    db = IMDb()
    movie = db.search_movie(movieName)[0]
    db.update(movie)
    return int(movie.get('rating') * 10)

def getRottenTomatoesScore():
    movie = RottenTomatoesClient.search(term = movieName, limit = 1)
    return movie["movies"][0]["meterScore"]

if __name__ == '__main__':
    args = docopt(__doc__)

    if args['generate']:
        movieName = args['<name>']
        chineseMovieName = movieName
        if args['--chinese']: chineseMovieName = args['--chinese']

        docs = ''

        docs += f'# {chineseMovieName}\n\n'

        docs += f'## 普遍評價\n\n'
        iscore = getIMDbScore()
        docs += f'[={iscore}% "IMDb : {iscore} / 100"]\n'
        rscore = getRottenTomatoesScore()
        docs += f'[={rscore}% "rottentomatoes : {rscore} / 100"]\n'
        docs += '\n'

        docs += f'## 我的評價\n\n'
        for name in rating:
            docs += f'[=0% "{name} : 0 / 10"]\n'
        docs += '\n'

        docs += f'## 感想\n\n'

        filename = f'{movieName.replace(" ", "-")}.md'
        open(filename, 'w').write(docs)
        print(f'Generate {filename}')

    elif args['calculate']:
        pass
