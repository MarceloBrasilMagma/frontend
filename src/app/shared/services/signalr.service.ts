import { Inject, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack'
import { NzModalService } from 'ng-zorro-antd/modal';
import { API_BASE_URL, NotificacaoVm } from '../../../../web-api-client';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EventService } from './event.service';

@Injectable({
    providedIn: 'root'
})
export class SignalRService {

    private hubConnection: HubConnection

    constructor(@Inject(API_BASE_URL) private apiBaseUrl,
        private modal: NzModalService,
        private eventService: EventService
    ) { }

    public connect = () => {
        this.startConnection();
        this.addListeners();
    }

    private getConnection(): HubConnection {
        return new HubConnectionBuilder()
            .withUrl(`${this.apiBaseUrl}/signalr`, {
                accessTokenFactory: () => localStorage.getItem('jwt')
            })
            .withAutomaticReconnect([0, 0, 2000, 2000, 5000, 5000, 5000, 5000, 10000])
            .withHubProtocol(new MessagePackHubProtocol())
            .build();
    }

    private startConnection() {
        this.hubConnection = this.getConnection();

        this.hubConnection.start()
            .then(() => console.log('connection started', this.hubConnection.connectionId))
            .catch((err) => {
                console.log('error while establishing signalr connection: ' + this.hubConnection.connectionId + err)
            })
    }

    private addListeners() {
        this.hubConnection.onclose(error => {
            console.log('onclose', this.hubConnection.connectionId);
            this.modal.confirm({
                nzTitle: 'Ocorreu uma falha de comunicação com o servidor',
                nzContent: 'O erro pode ter acontecido por alguma inconsistência no link de comunicação com a internet. Erro: ' + error,
                nzOnOk: () => window.location.reload(),
                nzCancelDisabled: true
            });
        });

        this.hubConnection.onreconnected(error => {
            console.log('onreconnected', this.hubConnection.connectionId);
        });

        this.hubConnection.onreconnecting(error => {
            console.log('onreconnecting' + this.hubConnection.connectionId);
        });

        this.hubConnection.on("novaNotificacao", () => {
            //debugger
            this.eventService.ExisteNovaNotificacao.emit();
        })


    }
}
