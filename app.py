from flask import Flask, render_template

# Configura a pasta 'static' explicitamente
# O segundo 'static' é o nome da pasta, o primeiro é o URL prefix
app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/')
def index():
    return render_template('index.html')

# NOVA ROTA DA TELA DE JOGO
@app.route('/jogo')
def jogo():
    # Renderiza o novo arquivo HTML
    return render_template('jogo.html')

if __name__ == '__main__':
    app.run(debug=True)