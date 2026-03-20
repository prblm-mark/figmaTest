import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino-AI---Design-System?node-id=2160-3648',
  {
    props: {
      type: figma.enum('Type', {
        Default: 'default',
        Desktop: 'desktop',
      }),
    },
    example: ({ type }) => html`
      <div class="chat-response-table-scroll">
        <table class="chat-response-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Sessions</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="chat-response-table__text">Olivia Chen</td>
              <td class="chat-response-table__text">olivia.chen@acme.io</td>
              <td>342</td>
              <td>2 hours ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }
);
