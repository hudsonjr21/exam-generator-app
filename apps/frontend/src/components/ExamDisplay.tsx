'use client';

import Image from 'next/image';
import { IExam } from '@exam-generator/core/src/exam.interface';

interface ExamDisplayProps {
  exam: IExam;
  professor: string;
  curso: string;
  subject: string;
  valor: string;
}

export default function ExamDisplay({
  exam,
  professor,
  curso,
  subject,
  valor,
}: ExamDisplayProps) {
  return (
    <section className="exam-section p-8 bg-white rounded-lg shadow">
      <header className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">PROVA {exam.version}</h2>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-shrink-0 mr-6">
            <Image
              src="/logo-if-hori.jpg"
              alt="Logo IF Sul de Minas"
              width={70}
              height={67}
              priority
            />
          </div>
          <div className="flex-grow text-xs space-y-1">
            <div className="flex justify-between">
              <div>
                <p>
                  <strong>PROFESSOR:</strong> {professor}
                </p>
                <p>
                  <strong>CURSO:</strong> {curso}
                </p>
                <p>
                  <strong>DISCIPLINA:</strong> {subject}
                </p>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-2">
                <strong>VALOR:</strong>{' '}
                <span className="text-left">{valor}</span>
                <strong>NOTA:</strong>{' '}
                <span className="text-left">_______________</span>
                <strong>DATA:</strong>{' '}
                <span className="text-left">____/____/______</span>
              </div>
            </div>
            <div className="flex justify-between">
              <p>
                <strong>ALUNO(A):</strong>{' '}
                ______________________________________________________________
              </p>
              <p>
                <strong>TURMA:</strong> ________________
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="questions-container mt-4">
        {exam.questions.map((q, index) => (
          <div key={q.id} className="question-item">
            <p
              className="font-semibold text-sm text-gray-800 leading-tight"
              dangerouslySetInnerHTML={{
                __html: `${index + 1}) ${q.prompt.replace(/\n/g, '<br />')}`,
              }}
            />
            <div className="mt-1">
              {Array.isArray(q.options) &&
                q.options.length > 0 &&
                q.options.map((opt, optionIndex) => (
                  <div key={opt} className="flex items-baseline">
                    <span className="font-semibold mr-2 print:text-sm">
                      {String.fromCharCode(65 + optionIndex)})
                    </span>
                    <span className="text-gray-700 leading-tight print:text-sm">
                      {opt}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
