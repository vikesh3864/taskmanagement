import React from 'react';

function TaskCard({ task, onEdit, onDelete, currentUser }) {
    const statusLabels = {
        todo: 'To Do',
        in_progress: 'In Progress',
        done: 'Done',
    };

    const priorityLabels = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
    };

    const canEdit =
        currentUser?.role === 'admin' ||
        (currentUser?.role === 'manager' && task.created_by === currentUser?.id) ||
        (currentUser?.role === 'member' && task.assigned_to === currentUser?.id);

    const canDelete =
        currentUser?.role === 'admin' ||
        (currentUser?.role === 'manager' && task.created_by === currentUser?.id);

    return (
        <div className={`task-card priority-${task.priority}`}>
            <div className="task-card-header">
                <h3 className="task-card-title">{task.title}</h3>
                <span className={`badge badge-${task.status}`}>
                    {statusLabels[task.status] || task.status}
                </span>
            </div>

            {task.description && (
                <p className="task-card-desc">{task.description}</p>
            )}

            <div className="task-card-meta">
                <span className={`badge badge-${task.priority}`}>
                    {priorityLabels[task.priority] || task.priority}
                </span>

                {task.assigned_to_detail && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        👤 {task.assigned_to_detail.username}
                    </span>
                )}

                {task.due_date && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        📅 {task.due_date}
                    </span>
                )}
            </div>

            <div className="task-card-actions">
                {canEdit && (
                    <button className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>
                        ✏️ Edit
                    </button>
                )}
                {canDelete && (
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)}>
                        🗑️ Delete
                    </button>
                )}
            </div>
        </div>
    );
}

export default TaskCard;
