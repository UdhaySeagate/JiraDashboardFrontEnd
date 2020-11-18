import React from 'react';

const Popover = ({ story, task, subtask, bug }) => {
  return (
    <div className="popover-table-content">
      <table>
        <tr>
          <th>Stories</th>
          <th>Tasks</th>
          <th>Sub-Tasks</th>
          <th>Bugs</th>
        </tr>
        <tr>
          <td>{story}</td>
          <td>{task}</td>
          <td>{subtask}</td>
          <td>{bug}</td>
        </tr>
      </table>
    </div>
  );
};

export default Popover;
