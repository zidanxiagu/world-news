interface Data {
  placeholder?: boolean;
  message?: string;
}

export function LearningNotes({ data }: { data: unknown }) {
  const d = data as Data | null;
  const isPlaceholder = d?.placeholder ?? true;
  return (
    <div>
      {isPlaceholder ? (
        <p className="card">{d?.message ?? '个人学习思考模块即将上线。'}</p>
      ) : (
        <p className="card">(待扩展)</p>
      )}
    </div>
  );
}
