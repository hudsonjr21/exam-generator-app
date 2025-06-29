'use client';
import React from 'react';

interface AnswerSheetProps {
  questionCount: number;
  idDigits: number;
  versionCount: number;
}

// Componente para uma única bolha, para reutilização
const Bubble = ({ text }: { text: string | number }) => (
  <div className="flex flex-col items-center">
    <span className="text-[8px] font-bold h-3">{text}</span>
    <div className="w-4 h-4 border border-black rounded-full"></div>
  </div>
);

// Função para dividir um array em "pedaços" (chunks) de um tamanho específico
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const AnswerSheet: React.FC<AnswerSheetProps> = ({
  questionCount,
  idDigits,
  versionCount,
}) => {
  const questionItems = Array.from({ length: questionCount }, (_, i) => i + 1);
  const idNumbers = Array.from({ length: 10 }, (_, i) => i); // 0 a 9
  const idDigitColumns = Array.from({ length: idDigits }, (_, i) => i + 1);
  const versionLetters = Array.from({ length: versionCount }, (_, i) =>
    String.fromCharCode(65 + i),
  );
  const bubbleOptions = ['A', 'B', 'C', 'D', 'E'];

  // Divide as questões em colunas de 10
  const questionColumns = chunkArray(questionItems, 10);

  return (
    <div className="answer-sheet-wrapper h-full flex flex-col p-2 text-xs">
      <div className="grid items-center border-b-2 border-black pb-1 mb-2">
        <div className="col-start-1 row-start-1 justify-self-center">
          <h2 className="text-base font-bold">CARTÃO DE RESPOSTA</h2>
        </div>
        <div className="col-start-1 row-start-1 justify-self-end">
          <div className="text-center">
            <h3 className="text-[10px] font-bold">TIPO DE PROVA</h3>
            <div className="flex gap-1">
              {versionLetters.map((letter) => (
                <Bubble key={letter} text={letter} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-black py-1 mt-2">
        <p>
          <strong>ALUNO(A):</strong>{' '}
          ________________________________________________________{' '}
          <strong>TURMA:</strong> ________
          <strong>DATA:</strong>____/____/_____
        </p>
      </div>

      <div className="flex justify-between items-start mt-1 pb-1 border-b border-black">
        {/* Coluna da Esquerda: Orientações */}
        <div className="w-[70%] pr-2">
          <p className="font-bold mb-1">Orientações para Avaliação:</p>
          {/* Container para as duas colunas de orientações */}
          <div className="flex gap-x-4 text-[9px] leading-tight">
            {/* Coluna 1 de Orientações */}
            <div className="space-y-px">
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>
                  A prova é composta por {questionCount} questões objetivas.
                </span>
              </div>
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>
                  Marque apenas uma alternativa por questão no cartão-resposta.
                </span>
              </div>
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>Utilize caneta esferográfica azul ou preta.</span>
              </div>
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>
                  Não rasure o cartão-resposta: rasuras anulam a questão.
                </span>
              </div>
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>
                  Preencha completamente o campo da alternativa escolhida.
                </span>
              </div>
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>A prova terá duração de duas aulas.</span>
              </div>
            </div>

            {/* Coluna 2 de Orientações */}
            <div className="space-y-px">
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>
                  É proibido qualquer tipo de consulta ou comunicação entre
                  alunos.
                </span>
              </div>
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <div>
                  {' '}
                  {/* Wrapper para o texto aninhado */}
                  <span>
                    Entregue a prova e o cartão-resposta devidamente preenchido
                    com:
                  </span>
                  <div className="pl-2">
                    <p>• Nome completo</p>
                    <p>• Número de chamada</p>
                    <p>• Turma</p>
                    <p>• Tipo de prova (A, B, etc.)</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>
                  Quem for pego colando, copiando ou auxiliando outro aluno terá
                  a prova anulada e nota zero.
                </span>
              </div>
              <div className="flex items-start">
                <span className="mr-1">✔</span>
                <span>Boa sorte e boa prova!</span>
              </div>
            </div>
          </div>
        </div>
        {/* Coluna da Direita: Número da Chamada */}
        <div className="w-[35%] pl-2 flex justify-end">
          <div className="text-center border border-black p-1 rounded">
            <h3 className="text-[10px] font-bold">Nº DA CHAMADA</h3>

            <div className="flex gap-x-2 justify-center mt-1 pt-1 border-t border-black">
              {idDigitColumns.map((col, index) => (
                // Adicionamos a lógica da borda aqui
                <div
                  key={`col-${col}`}
                  className={`
                            space-y-1 
                            ${index > 0 ? 'border-l border-black pl-2' : ''}
                          `}
                >
                  {/* Título da coluna (ex: 1º Dígito) */}
                  <p className="text-[8px] font-semibold h-3">{col}º Dígito</p>

                  {/* Primeira linha de bolhas (0-4) */}
                  <div className="flex gap-x-1">
                    {idNumbers.slice(0, 5).map((num) => (
                      <Bubble key={`id-${col}-${num}`} text={num} />
                    ))}
                  </div>
                  {/* Segunda linha de bolhas (5-9) */}
                  <div className="flex gap-x-1">
                    {idNumbers.slice(5, 10).map((num) => (
                      <Bubble key={`id-${col}-${num}`} text={num} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Respostas (Layout em colunas de 10) */}
      <div className="flex-grow mt-2">
        <div className="flex gap-x-4">
          {questionColumns.map((column, colIndex) => (
            // Container para cada coluna, com borda
            <div key={`q-col-${colIndex}`} className="border border-black p-1">
              <h3 className="text-center font-bold text-xs mb-1 border-b border-black pb-1">
                QUESTÃO/RESPOSTA
              </h3>
              {/* Cabeçalho da Coluna (A, B, C, D, E) */}
              <div className="flex mb-1">
                <div className="w-6 mr-2"></div>{' '}
                {/* Espaçador para alinhar com os números */}
                <div className="flex items-center gap-2">
                  {bubbleOptions.map((opt) => (
                    <span
                      key={opt}
                      className="font-bold text-xs w-4 text-center"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
              {/* Respostas da Coluna */}
              <div className="space-y-px">
                {column.map((qNumber) => (
                  <div key={`q-${qNumber}`} className="flex items-center gap-2">
                    <span className="font-bold text-xs w-6 text-right">
                      {qNumber}.
                    </span>
                    <div className="flex items-center gap-2">
                      {bubbleOptions.map((opt) => (
                        <div
                          key={opt}
                          className="w-4 h-4 border border-black rounded-full"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnswerSheet;
